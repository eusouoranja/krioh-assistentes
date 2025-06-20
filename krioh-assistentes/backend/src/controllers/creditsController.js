const { db } = require('../services/firebase');

// Consulta de créditos do usuário
async function getCredits(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const user = snapshot.docs[0].data();
    return res.status(200).json({ creditos: user.creditos });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar créditos.', error: error.message });
  }
}

// Compra simulada de créditos
async function purchaseCredits(req, res) {
  const { email, quantidade } = req.body;
  if (!email || !quantidade || quantidade < 1) {
    return res.status(400).json({ message: 'Email e quantidade válidos são obrigatórios.' });
  }
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const novosCreditos = (user.creditos || 0) + Number(quantidade);
    await usersRef.doc(userDoc.id).update({ creditos: novosCreditos });
    return res.status(200).json({ message: 'Créditos adicionados com sucesso.', creditos: novosCreditos });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao adicionar créditos.', error: error.message });
  }
}

module.exports = { getCredits, purchaseCredits }; 