const berandaService = require('../services/beranda.service');
const { successResponse, errorResponse } = require('../utils/response');

const getBeranda = async (req, res) => {
  try {
    const data = await berandaService.getBerandaData();
    
    // Format response untuk frontend
    const formattedData = {
      berita_terkini: data.berita_terkini.map(berita => ({
        id: berita.id_konten,
        judul: berita.judul,
        ringkasan: berita.ringkasan,
        thumbnail: berita.thumbnail,
        kategori: berita.nama_kategori,
        tanggal: berita.tanggal_publikasi_formatted
      }))
    };
    
    return successResponse(res, 'Data beranda berhasil diambil', formattedData);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getBeranda
};