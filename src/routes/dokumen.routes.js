const express = require('express');
const router = express.Router();
const dokumenController = require('../controllers/dokumen.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');

// Masyarakat routes - butuh login
// Dokumen publik tidak perlu login
router.get('/publik', dokumenController.getDokumenPublik);
router.get('/terbatas', authMiddleware, dokumenController.getDokumenTerbatas);
router.get('/terbatas/:id', authMiddleware, dokumenController.getDokumenTerbatasById);
// Update route untuk permohonan dengan upload file
router.post('/permohonan', authMiddleware, upload.single('lampiran_berkas'), dokumenController.ajukanPermohonan);
router.get('/permohonan/saya', authMiddleware, dokumenController.getPermohonanSaya);

// Admin routes
router.get('/admin/semua', authMiddleware, roleMiddleware('admin'), dokumenController.getAllDokumenAdmin);
router.get('/admin/permohonan', authMiddleware, roleMiddleware('admin'), dokumenController.getAllPermohonan);
router.put('/admin/permohonan/:id/status', authMiddleware, roleMiddleware('admin'), dokumenController.updateStatusPermohonan);
router.post('/admin', authMiddleware, roleMiddleware('admin'), upload.single('file'), dokumenController.createDokumen);
router.put('/admin/:id', authMiddleware, roleMiddleware('admin'), upload.single('file'), dokumenController.updateDokumen);
router.delete('/admin/:id', authMiddleware, roleMiddleware('admin'), dokumenController.deleteDokumen);
router.get('/download/:id', authMiddleware, dokumenController.downloadDokumen);

module.exports = router;
