const express = require('express');
const router = express.Router();
const sejarahDesaController = require('../controllers/sejarahDesa.controller');

// Public route - bisa diakses guest
router.get('/', sejarahDesaController.getSejarahDesa);

module.exports = router;