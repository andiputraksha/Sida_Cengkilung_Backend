const pool = require('../config/db');

const getSejarahDesa = async () => {
  const [rows] = await pool.execute('SELECT * FROM tb_sejarah LIMIT 1');
  
  if (rows.length === 0) {
    return {
      narasi_sejarah: 'Sejarah desa belum tersedia.',
      foto_representatif: null
    };
  }

  return rows[0];
};

module.exports = {
  getSejarahDesa
};