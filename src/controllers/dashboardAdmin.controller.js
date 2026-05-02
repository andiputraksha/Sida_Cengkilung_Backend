const dashboardAdminService = require('../services/dashboardAdmin.service');
const { successResponse, errorResponse } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await dashboardAdminService.getDashboardAdmin();
    
    // Format response untuk frontend
    const formattedData = {
      statistik: {
        total_penduduk: data.statistik.total_penduduk,
        total_konten: data.statistik.total_konten,
        total_dokumen: data.statistik.total_dokumen,
        permohonan_menunggu: data.statistik.permohonan_menunggu,
        // Tambahan untuk frontend
        konten_published: data.statistik.konten_published || 0,
        konten_draft: data.statistik.konten_draft || 0,
        konten_archived: data.statistik.konten_archived || 0,
        dokumen_publik: data.statistik.dokumen_publik || 0,
        dokumen_terbatas: data.statistik.dokumen_terbatas || 0,
        total_galeri: data.statistik.total_galeri || 0,
        galeri_foto: data.statistik.galeri_foto || 0,
        galeri_video: data.statistik.galeri_video || 0
      },
      distribusi_penduduk: data.distribusi_penduduk.map(item => ({
        status: item.status_kependudukan, // Tetap menggunakan 'permanen' atau 'nonpermanen'
        label: item.status_kependudukan === 'permanen' ? 'Penduduk Permanen' : 'Penduduk Non-Permanen',
        jumlah: item.jumlah,
        persentase: item.persentase
      })),
      chart_data: data.chart_data
    };
    
    return successResponse(res, 'Dashboard admin berhasil diambil', formattedData);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getDashboard
};