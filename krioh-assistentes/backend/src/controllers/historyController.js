const { db } = require('../services/firebase');

// Consulta histórico de interações do usuário
async function getHistory(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }
  try {
    const historicoRef = db.collection('historico');
    const snapshot = await historicoRef.where('email', '==', email).orderBy('timestamp', 'desc').limit(30).get();
    const historico = snapshot.docs.map(doc => doc.data());
    return res.status(200).json({ historico });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar histórico.', error: error.message });
  }
}

module.exports = { getHistory }; 