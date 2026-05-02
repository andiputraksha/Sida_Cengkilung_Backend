const pool = require('../config/db');

const getProfilDesa = async () => {
  const [profil] = await pool.execute('SELECT * FROM tb_profil_desa LIMIT 1');
  const [struktur] = await pool.execute(
    'SELECT * FROM tb_struktur_organisasi ORDER BY urutan_tampil'
  );

  if (profil.length === 0) {
    return {
      profil: {},
      struktur: []
    };
  }

  return {
    profil: profil[0],
    struktur: struktur
  };
};

module.exports = {
  getProfilDesa
};