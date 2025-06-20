const { db } = require('../services/firebase');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Envia prompt para IA, consome crédito e retorna resposta
async function askIA(req, res) {
  const { email, prompt } = req.body;
  if (!email || !prompt) {
    return res.status(400).json({ message: 'Email e prompt são obrigatórios.' });
  }
  try {
    // Busca usuário
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    if (!user.creditos || user.creditos < 1) {
      return res.status(402).json({ message: 'Créditos insuficientes.' });
    }
    // Chama OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é um assistente de marketing que escreve com o tom da marca.' },
        { role: 'user', content: prompt }
      ]
    });
    const respostaIA = response.choices[0].message.content;
    // Consome 1 crédito
    await usersRef.doc(userDoc.id).update({ creditos: user.creditos - 1 });
    // Salva histórico
    await db.collection('historico').add({
      email,
      prompt,
      resposta: respostaIA,
      timestamp: new Date()
    });
    return res.status(200).json({ resposta: respostaIA, creditos_restantes: user.creditos - 1 });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar IA.', error: error.message });
  }
}

module.exports = { askIA }; 