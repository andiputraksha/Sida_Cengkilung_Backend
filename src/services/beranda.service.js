const db = require('../config/db');

const getBerandaData = async () => {
  try {
    const pool = db.pool;
    
    // Hanya ambil 3 berita teratas (sudah benar)
    const [konten] = await pool.execute(`
      SELECT 
        k.id_konten,
        k.judul,
        k.ringkasan,
        k.thumbnail,
        k.tanggal_publikasi,
        kk.nama_kategori,
        DATE_FORMAT(k.tanggal_publikasi, '%d %M %Y') as tanggal_publikasi_formatted
      FROM tb_konten k
      LEFT JOIN tb_kategori_konten kk ON k.id_kategori_konten = kk.id_kategori_konten
      WHERE k.status_konten = 'published'
      ORDER BY k.tanggal_publikasi DESC
      LIMIT 3
    `);

    return {
      berita_terkini: konten,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getBerandaData:', error);
    throw new Error('Gagal mengambil data beranda');
  }
};

module.exports = {
  getBerandaData
};