const express = require('express');
const router = express.Router();
const statistikController = require('../controllers/statistikDesa.controller');

// Public route - bisa diakses guest
router.get('/', statistikController.getStatistik);

module.exports = router;