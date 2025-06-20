const express = require('express');
const router = express.Router();
const iaController = require('../controllers/iaController');

// POST /ia/ask
router.post('/ask', iaController.askIA);

module.exports = router; 