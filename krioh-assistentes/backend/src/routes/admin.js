const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /admin/clients (listar clientes)
router.get('/clients', adminController.listClients);

// POST /admin/clients/credits (ajuste manual de créditos)
router.post('/clients/credits', adminController.adjustCredits);

// POST /admin/materials (upload/simulação de material)
router.post('/materials', adminController.uploadMaterial);

// POST /admin/clients
router.post('/clients', (req, res) => {
  // TODO: Implementar cadastro/gestão de clientes
  res.status(501).json({ message: 'Gestão de clientes não implementada.' });
});

module.exports = router; 