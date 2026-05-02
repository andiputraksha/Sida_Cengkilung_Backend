const strukturDesaService = require('../services/strukturDesa.service');
const { successResponse, errorResponse } = require('../utils/response');

const getStrukturDesa = async (req, res) => {
  try {
    const data = await strukturDesaService.getStrukturDesa();
    return successResponse(res, 'Data struktur desa berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getStrukturDesa
};