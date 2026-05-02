const express = require('express');
const router = express.Router();
const galeriController = require('../controllers/galeri.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');

// Public routes - bisa diakses guest
router.get('/', galeriController.getAllGaleri);
router.get('/kategori', galeriController.getKategoriGaleri);
router.get('/:id', galeriController.getGaleriById);

// Admin routes
router.get('/admin/semua', authMiddleware, roleMiddleware('admin'), galeriController.getAllGaleriAdmin);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  galeriController.createGaleri
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  galeriController.updateGaleri
);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), galeriController.deleteGaleri);

module.exports = router;
