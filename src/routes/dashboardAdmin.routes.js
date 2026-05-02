const express = require('express');
const router = express.Router();
const dashboardAdminController = require('../controllers/dashboardAdmin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Admin routes only
router.get('/', authMiddleware, roleMiddleware('admin'), dashboardAdminController.getDashboard);

module.exports = router;