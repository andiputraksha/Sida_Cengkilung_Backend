const pool = require('../config/db');

const getStatistikPenduduk = async () => {
  // Total penduduk
  const [totalResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM tb_penduduk'
  );
  const totalPenduduk = totalResult[0].total;

  // Jenis kelamin
  const [jkResult] = await pool.execute(`
    SELECT 
      jenis_kelamin,
      COUNT(*) as jumlah,
      ROUND((COUNT(*) * 100.0 / ?), 2) as persentase
    FROM tb_penduduk 
    GROUP BY jenis_kelamin
  `, [totalPenduduk]);

  // Status kependudukan
  const [statusResult] = await pool.execute(`
    SELECT 
      status_kependudukan,
      COUNT(*) as jumlah,
      ROUND((COUNT(*) * 100.0 / ?), 2) as persentase
    FROM tb_penduduk 
    GROUP BY status_kependudukan
  `, [totalPenduduk]);

  // Pendidikan
  const [pendidikanResult] = await pool.execute(`
    SELECT 
      COALESCE(pendidikan, 'Tidak Disebutkan') as pendidikan,
      COUNT(*) as jumlah
    FROM tb_penduduk 
    GROUP BY pendidikan
    ORDER BY jumlah DESC
  `);

  // Pekerjaan
  const [pekerjaanResult] = await pool.execute(`
    SELECT 
      COALESCE(pekerjaan, 'Tidak Disebutkan') as pekerjaan,
      COUNT(*) as jumlah
    FROM tb_penduduk 
    GROUP BY pekerjaan
    ORDER BY jumlah DESC
    LIMIT 10
  `);

  // Kategori usia
  const [usiaResult] = await pool.execute(`
    SELECT 
      CASE
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 18 THEN 'Anak-anak (<18)'
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 18 AND 25 THEN 'Remaja (18-25)'
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 26 AND 35 THEN 'Dewasa Awal (26-35)'
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 36 AND 45 THEN 'Dewasa (36-45)'
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 46 AND 55 THEN 'Pra-Lansia (46-55)'
        WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 56 AND 65 THEN 'Lansia Awal (56-65)'
        ELSE 'Lansia (>65)'
      END as kategori_usia,
      COUNT(*) as jumlah
    FROM tb_penduduk 
    GROUP BY kategori_usia
    ORDER BY 
      CASE kategori_usia
        WHEN 'Anak-anak (<18)' THEN 1
        WHEN 'Remaja (18-25)' THEN 2
        WHEN 'Dewasa Awal (26-35)' THEN 3
        WHEN 'Dewasa (36-45)' THEN 4
        WHEN 'Pra-Lansia (46-55)' THEN 5
        WHEN 'Lansia Awal (56-65)' THEN 6
        ELSE 7
      END
  `);

  return {
    total_penduduk: totalPenduduk,
    jenis_kelamin: jkResult,
    status_kependudukan: statusResult,
    pendidikan: pendidikanResult,
    pekerjaan: pekerjaanResult,
    kategori_usia: usiaResult
  };
};

module.exports = {
  getStatistikPenduduk
};