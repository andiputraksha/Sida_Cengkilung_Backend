const statistikService = require('../services/statistik.service');
const { successResponse, errorResponse } = require('../utils/response');

const getStatistik = async (req, res) => {
  try {
    const data = await statistikService.getStatistikPenduduk();
    return successResponse(res, 'Data statistik berhasil diambil', data);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getStatistik
};