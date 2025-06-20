const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/creditsController');

// GET /credits
router.get('/', (req, res) => {
  // TODO: Implementar consulta de créditos
  res.status(501).json({ message: 'Consulta de créditos não implementada.' });
});

// POST /credits (consulta créditos)
router.post('/', creditsController.getCredits);

// POST /credits/purchase (compra simulada de créditos)
router.post('/purchase', creditsController.purchaseCredits);

module.exports = router; 