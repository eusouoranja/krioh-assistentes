const { db } = require('../services/firebase');
const jwt = require('jsonwebtoken');

// Registro de novo usuário
async function register(req, res) {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }
  try {
    // Verifica se já existe usuário com o mesmo e-mail
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }
    // Cria novo usuário
    const novoUsuario = {
      nome,
      email,
      senha, // Em produção, fazer hash da senha!
      creditos: 50, // Créditos iniciais
      criadoEm: new Date()
    };
    await usersRef.add(novoUsuario);
    return res.status(201).json({ message: 'Usuário registrado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
}

// Login de usuário
async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).where('senha', '==', senha).get();
    if (snapshot.empty) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const user = snapshot.docs[0].data();
    // Gerar token JWT
    const token = jwt.sign(
      { email: user.email, nome: user.nome, admin: user.email === 'admin@krioh.com' },
      process.env.JWT_SECRET || 'krioh_secret',
      { expiresIn: '7d' }
    );
    return res.status(200).json({ message: 'Login realizado com sucesso.', user, token });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
}

module.exports = { register, login }; 