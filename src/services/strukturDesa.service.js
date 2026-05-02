const pool = require('../config/db');

const getStrukturDesa = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM tb_struktur_organisasi ORDER BY urutan_tampil'
  );
  
  return rows;
};

module.exports = {
  getStrukturDesa
};