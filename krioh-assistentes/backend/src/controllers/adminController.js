const { db } = require('../services/firebase');

// Lista todos os clientes cadastrados
async function listClients(req, res) {
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.get();
    const clientes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome,
        email: data.email,
        creditos: data.creditos || 0,
        criadoEm: data.criadoEm
      };
    });
    return res.status(200).json({ clientes });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar clientes.', error: error.message });
  }
}

// Ajuste manual de créditos de um cliente
async function adjustCredits(req, res) {
  const { email, quantidade } = req.body;
  if (!email || typeof quantidade !== 'number') {
    return res.status(400).json({ message: 'Email e quantidade numérica são obrigatórios.' });
  }
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const novosCreditos = Math.max(0, (user.creditos || 0) + quantidade);
    await usersRef.doc(userDoc.id).update({ creditos: novosCreditos });
    return res.status(200).json({ message: 'Créditos ajustados com sucesso.', creditos: novosCreditos });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao ajustar créditos.', error: error.message });
  }
}

// Upload/simulação de material para IA
async function uploadMaterial(req, res) {
  const { email, tipo, conteudo } = req.body;
  if (!email || !tipo || !conteudo) {
    return res.status(400).json({ message: 'Email, tipo e conteúdo são obrigatórios.' });
  }
  try {
    // Verifica se o cliente existe
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    // Salva material
    await db.collection('materiais').add({
      email,
      tipo,
      conteudo,
      criadoEm: new Date()
    });
    return res.status(201).json({ message: 'Material salvo com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar material.', error: error.message });
  }
}

module.exports = { listClients, adjustCredits, uploadMaterial }; 