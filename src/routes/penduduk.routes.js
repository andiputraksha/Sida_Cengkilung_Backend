const express = require('express');
const router = express.Router();
const pendudukController = require('../controllers/penduduk.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Admin routes only
router.get('/', authMiddleware, roleMiddleware('admin'), pendudukController.getAllPenduduk);
router.get('/export', authMiddleware, roleMiddleware('admin'), pendudukController.exportPenduduk);
router.get('/:id', authMiddleware, roleMiddleware('admin'), pendudukController.getPendudukById);
router.post('/', authMiddleware, roleMiddleware('admin'), pendudukController.createPenduduk);
router.put('/:id', authMiddleware, roleMiddleware('admin'), pendudukController.updatePenduduk);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), pendudukController.deletePenduduk);

module.exports = router;