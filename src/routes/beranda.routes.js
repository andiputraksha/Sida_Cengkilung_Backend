const express = require('express');
const router = express.Router();
const berandaController = require('../controllers/beranda.controller');

// Public route - bisa diakses guest
router.get('/', berandaController.getBeranda);

module.exports = router;