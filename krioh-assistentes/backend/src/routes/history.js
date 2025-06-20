const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// GET /history
router.get('/', (req, res) => {
  // TODO: Implementar consulta de histórico
  res.status(501).json({ message: 'Consulta de histórico não implementada.' });
});

// POST /history (consulta histórico do usuário)
router.post('/', historyController.getHistory);

module.exports = router; 