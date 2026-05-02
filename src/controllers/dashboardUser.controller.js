const dashboardUserService = require('../services/dashboardUser.service');
const { successResponse, errorResponse } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await dashboardUserService.getDashboardUser(req.user.id);
    
    // Format response untuk frontend - hanya username dan berita
    const formattedData = {
      user: {
        nama: data.user_info.nama,
        // Ambil inisial untuk avatar
        avatar_text: data.user_info.nama ? data.user_info.nama.charAt(0).toUpperCase() : 'U'
      },
      berita: data.berita_terkini.map(berita => ({
        id: berita.id_konten,
        judul: berita.judul,
        ringkasan: berita.ringkasan,
        thumbnail: berita.thumbnail,
        tanggal: berita.tanggal_publikasi_formatted
      }))
    };
    
    return successResponse(res, 'Dashboard user berhasil diambil', formattedData);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getDashboard
};