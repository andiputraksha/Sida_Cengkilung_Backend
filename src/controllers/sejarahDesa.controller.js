const sejarahDesaService = require('../services/sejarahDesa.service');
const { successResponse, errorResponse } = require('../utils/response');

const getSejarahDesa = async (req, res) => {
  try {
    const data = await sejarahDesaService.getSejarahDesa();
    return successResponse(res, 'Data sejarah desa berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getSejarahDesa
};