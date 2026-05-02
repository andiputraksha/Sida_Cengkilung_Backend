const express = require('express');
const router = express.Router();
const strukturDesaController = require('../controllers/strukturDesa.controller');

// Public route - bisa diakses guest
router.get('/', strukturDesaController.getStrukturDesa);

module.exports = router;