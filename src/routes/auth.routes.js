const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;