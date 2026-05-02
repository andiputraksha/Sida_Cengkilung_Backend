const express = require('express');
const router = express.Router();
const dashboardUserController = require('../controllers/dashboardUser.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Masyarakat routes - butuh login
router.get('/', authMiddleware, dashboardUserController.getDashboard);

module.exports = router;