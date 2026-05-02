const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/pengguna.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Admin routes only
router.get('/', authMiddleware, roleMiddleware('admin'), penggunaController.getAllPengguna);
router.get('/reset-requests', authMiddleware, roleMiddleware('admin'), penggunaController.getResetRequests);
router.get('/:id', authMiddleware, roleMiddleware('admin'), penggunaController.getPenggunaById);
router.post('/', authMiddleware, roleMiddleware('admin'), penggunaController.createPengguna);
router.put('/:id', authMiddleware, roleMiddleware('admin'), penggunaController.updatePengguna);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), penggunaController.deletePengguna);
router.post('/:id/reset-password', authMiddleware, roleMiddleware('admin'), penggunaController.resetPassword);

module.exports = router;