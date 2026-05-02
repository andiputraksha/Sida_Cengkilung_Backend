const db = require('../config/db');

const getDashboardUser = async (userId) => {
  try {
    const pool = db.pool;
    
    // Ambil hanya username untuk ditampilkan sebagai avatar
    const [user] = await pool.execute(
      `SELECT 
        nama_lengkap
      FROM tb_pengguna WHERE id_pengguna = ?`,
      [userId]
    );

    // Hanya ambil 3 berita teratas (sama dengan beranda)
    const [konten] = await pool.execute(`
      SELECT 
        k.id_konten,
        k.judul,
        k.ringkasan,
        k.thumbnail,
        DATE_FORMAT(k.tanggal_publikasi, '%d %M %Y') as tanggal_publikasi_formatted
      FROM tb_konten k
      WHERE k.status_konten = 'published'
      ORDER BY k.tanggal_publikasi DESC 
      LIMIT 3
    `);

    return {
      user_info: {
        nama: user[0]?.nama_lengkap || ''
      },
      berita_terkini: konten
    };
  } catch (error) {
    console.error('Error in getDashboardUser:', error);
    throw new Error('Gagal mengambil data dashboard user');
  }
};

module.exports = {
  getDashboardUser
};