const profilDesaService = require('../services/profilDesa.service');
const { successResponse, errorResponse } = require('../utils/response');

const getProfilDesa = async (req, res) => {
  try {
    const data = await profilDesaService.getProfilDesa();
    return successResponse(res, 'Data profil desa berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getProfilDesa
};