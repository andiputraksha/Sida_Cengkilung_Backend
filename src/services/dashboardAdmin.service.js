const db = require('../config/db');

const getDashboardAdmin = async () => {
  try {
    const pool = db.pool;
    
    // 1. Total Penduduk
    const [totalPenduduk] = await pool.execute('SELECT COUNT(*) as total FROM tb_penduduk');
    
    // 2. Statistik Konten (lengkap dengan breakdown)
    const [totalKonten] = await pool.execute('SELECT COUNT(*) as total FROM tb_konten');
    const [kontenPublished] = await pool.execute('SELECT COUNT(*) as total FROM tb_konten WHERE status_konten = "published"');
    const [kontenDraft] = await pool.execute('SELECT COUNT(*) as total FROM tb_konten WHERE status_konten = "draft"');
    const [kontenArchived] = await pool.execute('SELECT COUNT(*) as total FROM tb_konten WHERE status_konten = "archived"');
    
    // 3. Statistik Dokumen
    const [totalDokumen] = await pool.execute('SELECT COUNT(*) as total FROM tb_dokumen WHERE status_dokumen = "aktif"');
    const [dokumenPublik] = await pool.execute('SELECT COUNT(*) as total FROM tb_dokumen WHERE hak_akses = "publik" AND status_dokumen = "aktif"');
    const [dokumenTerbatas] = await pool.execute('SELECT COUNT(*) as total FROM tb_dokumen WHERE hak_akses = "terbatas" AND status_dokumen = "aktif"');
    
    // 4. Total pengajuan surat menunggu
    const [pendingPermohonan] = await pool.execute(
      'SELECT COUNT(*) as total FROM tb_pengajuan_surat WHERE status = "MENUNGGU"'
    );

    // 5. Total Pengguna Aktif
    const [totalPengguna] = await pool.execute('SELECT COUNT(*) as total FROM tb_pengguna WHERE status_akun = "aktif"');
    
    // 6. Statistik Galeri
    const [totalGaleri] = await pool.execute('SELECT COUNT(*) as total FROM tb_galeri');
    const [galeriFoto] = await pool.execute('SELECT COUNT(*) as total FROM tb_galeri WHERE tipe_media = "foto"');
    const [galeriVideo] = await pool.execute('SELECT COUNT(*) as total FROM tb_galeri WHERE tipe_media = "video"');

    // 7. Distribusi penduduk (permanen dan non permanen)
    const [distribusiPenduduk] = await pool.execute(`
      SELECT 
        status_kependudukan,
        COUNT(*) as jumlah,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tb_penduduk)), 1) as persentase
      FROM tb_penduduk 
      GROUP BY status_kependudukan
      ORDER BY status_kependudukan
    `);

    // Pastikan kedua status ada (jika salah satu tidak ada, tambahkan dengan nilai 0)
    let permanenData = distribusiPenduduk.find(item => item.status_kependudukan === 'permanen');
    let nonPermanenData = distribusiPenduduk.find(item => item.status_kependudukan === 'nonpermanen');
    
    if (!permanenData) {
      permanenData = { status_kependudukan: 'permanen', jumlah: 0, persentase: 0 };
      distribusiPenduduk.push(permanenData);
    }
    if (!nonPermanenData) {
      nonPermanenData = { status_kependudukan: 'nonpermanen', jumlah: 0, persentase: 0 };
      distribusiPenduduk.push(nonPermanenData);
    }

    // Format data untuk donat chart
    const chartData = {
      labels: ['Penduduk Permanen', 'Penduduk Non-Permanen'],
      datasets: [{
        data: [
          permanenData.persentase || 0,
          nonPermanenData.persentase || 0
        ],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderWidth: 1
      }]
    };

    // 8. Latest users (untuk dashboard)
    const [latestUsers] = await pool.execute(`
      SELECT 
        nama_lengkap, 
        email, 
        role,
        DATE_FORMAT(tanggal_daftar, '%d %M %Y') as tanggal_daftar_formatted
      FROM tb_pengguna 
      WHERE status_akun = 'aktif'
      ORDER BY tanggal_daftar DESC 
      LIMIT 5
    `);

    return {
      statistik: {
        total_penduduk: totalPenduduk[0]?.total || 0,
        total_konten: totalKonten[0]?.total || 0,
        konten_published: kontenPublished[0]?.total || 0,
        konten_draft: kontenDraft[0]?.total || 0,
        konten_archived: kontenArchived[0]?.total || 0,
        total_dokumen: totalDokumen[0]?.total || 0,
        dokumen_publik: dokumenPublik[0]?.total || 0,
        dokumen_terbatas: dokumenTerbatas[0]?.total || 0,
        permohonan_menunggu: pendingPermohonan[0]?.total || 0,
        total_pengguna: totalPengguna[0]?.total || 0,
        total_galeri: totalGaleri[0]?.total || 0,
        galeri_foto: galeriFoto[0]?.total || 0,
        galeri_video: galeriVideo[0]?.total || 0
      },
      distribusi_penduduk: distribusiPenduduk,
      chart_data: chartData,
      pengguna_terbaru: latestUsers,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getDashboardAdmin:', error);
    throw new Error('Gagal mengambil data dashboard admin');
  }
};

module.exports = {
  getDashboardAdmin
};