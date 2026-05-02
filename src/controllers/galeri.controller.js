const galeriService = require('../services/galeri.service');
const { successResponse, errorResponse } = require('../utils/response');

const resolveMediaPath = (body = {}, file = null) => {
  const sumberMedia = body.sumber_media;
  const youtubeUrl = body.youtube_url ? body.youtube_url.trim() : null;

  if (file) {
    return file.path.replace(/\\/g, '/');
  }

  if (sumberMedia === 'youtube' && youtubeUrl) {
    return youtubeUrl;
  }

  if (body.file_path) {
    return body.file_path;
  }

  return null;
};

const getUploadedFilePath = (req, fieldName) => {
  // Untuk route lama (single) fallback ke req.file
  if (fieldName === 'file' && req.file) {
    return req.file.path.replace(/\\/g, '/');
  }

  const file = req.files?.[fieldName]?.[0];
  return file ? file.path.replace(/\\/g, '/') : null;
};

// PUBLIC CONTROLLERS
const getAllGaleri = async (req, res) => {
  try {
    const filter = req.query;
    const data = await galeriService.getAllGaleri(filter);
    return successResponse(res, 'Data galeri berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getGaleriById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await galeriService.getGaleriById(id);
    return successResponse(res, 'Detail galeri berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getKategoriGaleri = async (req, res) => {
  try {
    const data = await galeriService.getKategoriGaleri();
    return successResponse(res, 'Data kategori galeri berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ADMIN CONTROLLERS
const getAllGaleriAdmin = async (req, res) => {
  try {
    const data = await galeriService.getAllGaleriAdmin();
    return successResponse(res, 'Data galeri admin berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const createGaleri = async (req, res) => {
  try {
    const mediaFilePath = getUploadedFilePath(req, 'file');
    const thumbnailFilePath = getUploadedFilePath(req, 'thumbnail');

    const galeriData = {
      ...req.body,
      file_path: resolveMediaPath(req.body, mediaFilePath ? { path: mediaFilePath } : null),
      thumbnail: thumbnailFilePath || req.body.thumbnail || null
    };
    const result = await galeriService.createGaleri(galeriData);

    // Log aktivitas
    const pool = require('../config/db');
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'CREATE_GALERI', `Membuat galeri: ${galeriData.judul_media}`]
    );

    return successResponse(res, 'Galeri berhasil dibuat', result, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateGaleri = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaFilePath = getUploadedFilePath(req, 'file');
    const thumbnailFilePath = getUploadedFilePath(req, 'thumbnail');
    const mediaPath = resolveMediaPath(req.body, mediaFilePath ? { path: mediaFilePath } : null);

    const galeriData = {
      ...req.body,
      ...(mediaPath ? { file_path: mediaPath } : {}),
      ...(thumbnailFilePath ? { thumbnail: thumbnailFilePath } : {})
    };
    const result = await galeriService.updateGaleri(id, galeriData);

    // Log aktivitas
    const pool = require('../config/db');
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'UPDATE_GALERI', `Memperbarui galeri ID: ${id}`]
    );

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteGaleri = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await galeriService.deleteGaleri(id);

    // Log aktivitas
    const pool = require('../config/db');
    await pool.execute(
      'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
      [req.user.id, 'DELETE_GALERI', `Menghapus galeri ID: ${id}`]
    );

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  // Public
  getAllGaleri,
  getGaleriById,
  getKategoriGaleri,
  // Admin
  getAllGaleriAdmin,
  createGaleri,
  updateGaleri,
  deleteGaleri
};
