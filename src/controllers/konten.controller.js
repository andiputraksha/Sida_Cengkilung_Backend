const kontenService = require('../services/konten.service');
const { successResponse, errorResponse } = require('../utils/response');
const { saveUploadedFile } = require('../middlewares/upload.middleware');

// PUBLIC CONTROLLERS
const getAllKonten = async (req, res) => {
  try {
    const filter = req.query;
    const data = await kontenService.getAllKonten(filter);
    return successResponse(res, 'Data konten berhasil diambil', data);
  } catch (error) {
    console.error('[GET /api/konten] Error:', error.message);
    return errorResponse(res, error.message);
  }
};

const getKontenById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await kontenService.getKontenById(id);
    return successResponse(res, 'Detail konten berhasil diambil', data);
  } catch (error) {
    console.error('[GET /api/konten/:id] Error:', error.message);
    return errorResponse(res, error.message);
  }
};

const getKategoriKonten = async (req, res) => {
  try {
    const data = await kontenService.getKategoriKonten();
    return successResponse(res, 'Data kategori konten berhasil diambil', data);
  } catch (error) {
    console.error('[GET /api/konten/kategori] Error:', error.message);
    return errorResponse(res, error.message);
  }
};

// ADMIN CONTROLLERS
const getAllKontenAdmin = async (req, res) => {
  try {
    const data = await kontenService.getAllKontenAdmin();
    return successResponse(res, 'Data konten admin berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const createKonten = async (req, res) => {
  try {
    let thumbnailPath = null;
    if (req.file) {
      thumbnailPath = await saveUploadedFile(req.file, 'konten');
      if (!thumbnailPath) {
        return errorResponse(res, 'Gagal menyimpan file thumbnail');
      }
    }

    const kontenData = {
      ...req.body,
      thumbnail: thumbnailPath
    };
    const result = await kontenService.createKonten(kontenData, req.user.id);

    // Log aktivitas
    const pool = require('../config/db').pool;
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'CREATE_KONTEN', `Membuat konten: ${kontenData.judul}`]
    );

    return successResponse(res, 'Konten berhasil dibuat', result, 201);
  } catch (error) {
    console.error('[POST /api/konten] Error:', error.message);
    return errorResponse(res, error.message);
  }
};

const updateKonten = async (req, res) => {
  try {
    const { id } = req.params;
    let thumbnailPath;

    if (req.file) {
      thumbnailPath = await saveUploadedFile(req.file, 'konten');
      if (!thumbnailPath) {
        return errorResponse(res, 'Gagal menyimpan file thumbnail');
      }
    }

    const kontenData = {
      ...req.body,
      ...(req.file ? { thumbnail: thumbnailPath } : {})
    };
    
    // Tambahkan tanggal_diperbarui otomatis
    kontenData.tanggal_diperbarui = new Date();
    
    const result = await kontenService.updateKonten(id, kontenData, req.user.id);

    // Log aktivitas
    const pool = require('../config/db').pool;
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'UPDATE_KONTEN', `Memperbarui konten ID: ${id}`]
    );

    return successResponse(res, result.message);
  } catch (error) {
    console.error('[PUT /api/konten/:id] Error:', error.message);
    return errorResponse(res, error.message);
  }
};

const deleteKonten = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await kontenService.deleteKonten(id);

    // Log aktivitas
    const pool = require('../config/db').pool;
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'DELETE_KONTEN', `Menghapus konten ID: ${id}`]
    );

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  // Public
  getAllKonten,
  getKontenById,
  getKategoriKonten,
  // Admin
  getAllKontenAdmin,
  createKonten,
  updateKonten,
  deleteKonten
};
