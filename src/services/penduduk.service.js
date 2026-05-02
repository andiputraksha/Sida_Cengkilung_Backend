const { pool } = require('../config/db');

const getAllPenduduk = async (filters = {}) => {
  let query = 'SELECT * FROM tb_penduduk WHERE 1=1';
  const params = [];

  const statusKependudukan = filters.status_kependudukan || filters.status;
  if (statusKependudukan) {
    query += ' AND status_kependudukan = ?';
    params.push(statusKependudukan);
  }

  if (filters.jenis_kelamin) {
    query += ' AND jenis_kelamin = ?';
    params.push(filters.jenis_kelamin);
  }

  if (filters.agama) {
    query += ' AND agama = ?';
    params.push(filters.agama);
  }

  if (filters.search) {
    query += ' AND (nama LIKE ? OR nik LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY nama';

  const [rows] = await pool.execute(query, params);
  return rows;
};

const getPendudukById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM tb_penduduk WHERE id_penduduk = ?',
    [id]
  );

  if (rows.length === 0) {
    throw new Error('Penduduk tidak ditemukan');
  }

  return rows[0];
};

const createPenduduk = async (pendudukData) => {
  const {
    nik,
    nama,
    jenis_kelamin,
    tanggal_lahir,
    agama,
    pekerjaan,
    pendidikan,
    status_kependudukan = 'permanen'
  } = pendudukData;

  // Check if NIK already exists
  const [existing] = await pool.execute(
    'SELECT id_penduduk FROM tb_penduduk WHERE nik = ?',
    [nik]
  );

  if (existing.length > 0) {
    throw new Error('NIK sudah terdaftar');
  }

  const [result] = await pool.execute(
    `INSERT INTO tb_penduduk (
      nik, nama, jenis_kelamin, tanggal_lahir, 
      agama, pekerjaan, pendidikan, status_kependudukan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nik, nama, jenis_kelamin, tanggal_lahir, agama, pekerjaan, pendidikan, status_kependudukan]
  );

  return { id: result.insertId };
};

const updatePenduduk = async (id, pendudukData) => {
  const {
    nik,
    nama,
    jenis_kelamin,
    tanggal_lahir,
    agama,
    pekerjaan,
    pendidikan,
    status_kependudukan
  } = pendudukData;

  // Check if NIK already exists for other penduduk
  if (nik) {
    const [existing] = await pool.execute(
      'SELECT id_penduduk FROM tb_penduduk WHERE nik = ? AND id_penduduk != ?',
      [nik, id]
    );

    if (existing.length > 0) {
      throw new Error('NIK sudah digunakan oleh penduduk lain');
    }
  }

  const updateFields = [];
  const values = [];

  if (nik) { updateFields.push('nik = ?'); values.push(nik); }
  if (nama) { updateFields.push('nama = ?'); values.push(nama); }
  if (jenis_kelamin) { updateFields.push('jenis_kelamin = ?'); values.push(jenis_kelamin); }
  if (tanggal_lahir) { updateFields.push('tanggal_lahir = ?'); values.push(tanggal_lahir); }
  if (agama) { updateFields.push('agama = ?'); values.push(agama); }
  if (pekerjaan) { updateFields.push('pekerjaan = ?'); values.push(pekerjaan); }
  if (pendidikan) { updateFields.push('pendidikan = ?'); values.push(pendidikan); }
  if (status_kependudukan) { updateFields.push('status_kependudukan = ?'); values.push(status_kependudukan); }

  values.push(id);

  const query = `UPDATE tb_penduduk SET ${updateFields.join(', ')} WHERE id_penduduk = ?`;
  
  const [result] = await pool.execute(query, values);
  
  if (result.affectedRows === 0) {
    throw new Error('Penduduk tidak ditemukan');
  }

  return { message: 'Penduduk berhasil diperbarui' };
};

const deletePenduduk = async (id) => {
  const [result] = await pool.execute('DELETE FROM tb_penduduk WHERE id_penduduk = ?', [id]);
  
  if (result.affectedRows === 0) {
    throw new Error('Penduduk tidak ditemukan');
  }

  return { message: 'Penduduk berhasil dihapus' };
};

const exportPenduduk = async (filters = {}) => {
  const penduduk = await getAllPenduduk(filters);
  
  // Format untuk export CSV
  const csvHeaders = [
    'NIK', 'Nama', 'Jenis Kelamin', 'Tanggal Lahir',
    'Agama', 'Pekerjaan', 'Pendidikan', 'Status Kependudukan'
  ];

  const csvRows = penduduk.map(p => [
    p.nik,
    p.nama,
    p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    new Date(p.tanggal_lahir).toLocaleDateString('id-ID'),
    p.agama || '',
    p.pekerjaan || '',
    p.pendidikan || '',
    p.status_kependudukan === 'permanen' ? 'Permanen' : 'Non-Permanen'
  ]);

  return {
    headers: csvHeaders,
    rows: csvRows,
    total: penduduk.length
  };
};

module.exports = {
  getAllPenduduk,
  getPendudukById,
  createPenduduk,
  updatePenduduk,
  deletePenduduk,
  exportPenduduk
};
