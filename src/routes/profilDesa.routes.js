const express = require('express');
const router = express.Router();
const profilDesaController = require('../controllers/profilDesa.controller');

// Public route - bisa diakses guest
router.get('/', profilDesaController.getProfilDesa);

module.exports = router;