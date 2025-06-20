require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authenticateJWT = require('./middlewares/authMiddleware');
const requireAdmin = require('./middlewares/adminMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Krioh Assistentes rodando!');
});

// TODO: importar e usar rotas de autenticação, créditos, IA, histórico, admin
const authRoutes = require('./routes/auth');
const creditsRoutes = require('./routes/credits');
const iaRoutes = require('./routes/ia');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/credits', authenticateJWT, creditsRoutes);
app.use('/ia', authenticateJWT, iaRoutes);
app.use('/history', authenticateJWT, historyRoutes);
app.use('/admin', authenticateJWT, requireAdmin, adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
