const penggunaService = require('../services/pengguna.service');
const { successResponse, errorResponse } = require('../utils/response');

const getAllPengguna = async (req, res) => {
  try {
    const { role, search } = req.query;  // tambahkan search
    const data = await penggunaService.getAllPengguna(role, search);
    return successResponse(res, 'Data pengguna berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getPenggunaById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await penggunaService.getPenggunaById(id);
    return successResponse(res, 'Detail pengguna berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const createPengguna = async (req, res) => {
  try {
    const penggunaData = req.body;
    
    if (!penggunaData.nama_lengkap || !penggunaData.email || !penggunaData.password) {
      return errorResponse(res, 'Nama lengkap, email, dan password harus diisi');
    }

    if (penggunaData.password.length < 6) {
      return errorResponse(res, 'Password minimal 6 karakter');
    }

    const result = await penggunaService.createPengguna(penggunaData);
    return successResponse(res, 'Pengguna berhasil dibuat', result, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updatePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const penggunaData = req.body;

    if (penggunaData.password && penggunaData.password.length < 6) {
      return errorResponse(res, 'Password minimal 6 karakter');
    }

    const result = await penggunaService.updatePengguna(id, penggunaData);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deletePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const result = await penggunaService.deletePengguna(id, currentUserId);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal 6 karakter');
    }

    const result = await penggunaService.resetPassword(id, newPassword);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getResetRequests = async (req, res) => {
  try {
    const requests = await penggunaService.getResetPasswordRequests();
    return successResponse(res, 'Permintaan reset password', requests);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
  resetPassword,
  getResetRequests
};