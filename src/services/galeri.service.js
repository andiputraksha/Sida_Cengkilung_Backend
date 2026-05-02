const pool = require('../config/db');

const isNil = (value) => value === undefined || value === null;
const toNullIfEmpty = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

const getAllGaleri = async (filter = {}) => {
  let query = `
    SELECT g.*, kg.nama_kategori 
    FROM tb_galeri g
    LEFT JOIN tb_kategori_galeri kg ON g.id_kategori_galeri = kg.id_kategori_galeri
    WHERE 1=1
  `;
  const params = [];

  if (filter.kategori) {
    query += ' AND kg.nama_kategori = ?';
    params.push(filter.kategori);
  }

  if (filter.tipe) {
    query += ' AND g.tipe_media = ?';
    params.push(filter.tipe);
  }

  query += ' ORDER BY g.tanggal_publikasi DESC';

  const [rows] = await pool.execute(query, params);
  return rows;
};

const getGaleriById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT g.*, kg.nama_kategori 
    FROM tb_galeri g
    LEFT JOIN tb_kategori_galeri kg ON g.id_kategori_galeri = kg.id_kategori_galeri
    WHERE g.id_galeri = ?
  `, [id]);

  if (rows.length === 0) {
    throw new Error('Galeri tidak ditemukan');
  }

  return rows[0];
};

const getKategoriGaleri = async () => {
  const [rows] = await pool.execute('SELECT * FROM tb_kategori_galeri ORDER BY nama_kategori');
  return rows;
};

// ADMIN FUNCTIONS
const getAllGaleriAdmin = async () => {
  const [rows] = await pool.execute(`
    SELECT g.*, kg.nama_kategori 
    FROM tb_galeri g
    LEFT JOIN tb_kategori_galeri kg ON g.id_kategori_galeri = kg.id_kategori_galeri
    ORDER BY g.tanggal_publikasi DESC
  `);
  return rows;
};

const createGaleri = async (galeriData) => {
  const {
    judul_media,
    tipe_media,
    file_path,
    thumbnail,
    id_kategori_galeri,
    tanggal_publikasi
  } = galeriData;

  if (!judul_media || !tipe_media || !id_kategori_galeri || !file_path) {
    throw new Error('Judul, tipe media, kategori, dan file wajib diisi');
  }

  const [result] = await pool.execute(
    `INSERT INTO tb_galeri (
      judul_media, tipe_media, file_path, thumbnail,
      id_kategori_galeri, tanggal_publikasi
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      judul_media,
      tipe_media,
      file_path,
      toNullIfEmpty(thumbnail),
      Number(id_kategori_galeri),
      toNullIfEmpty(tanggal_publikasi) || new Date()
    ]
  );

  return { id: result.insertId };
};

const updateGaleri = async (id, galeriData) => {
  const {
    judul_media,
    tipe_media,
    file_path,
    thumbnail,
    id_kategori_galeri
  } = galeriData;

  const updateFields = [];
  const values = [];

  if (!isNil(judul_media)) { updateFields.push('judul_media = ?'); values.push(judul_media); }
  if (!isNil(tipe_media)) { updateFields.push('tipe_media = ?'); values.push(tipe_media); }
  if (!isNil(file_path)) { updateFields.push('file_path = ?'); values.push(file_path); }
  if (!isNil(thumbnail)) { updateFields.push('thumbnail = ?'); values.push(toNullIfEmpty(thumbnail)); }
  if (!isNil(id_kategori_galeri)) { updateFields.push('id_kategori_galeri = ?'); values.push(Number(id_kategori_galeri)); }

  if (updateFields.length === 0) {
    throw new Error('Tidak ada data yang diperbarui');
  }

  values.push(id);

  const query = `UPDATE tb_galeri SET ${updateFields.join(', ')} WHERE id_galeri = ?`;
  
  const [result] = await pool.execute(query, values);
  
  if (result.affectedRows === 0) {
    throw new Error('Galeri tidak ditemukan');
  }

  return { message: 'Galeri berhasil diperbarui' };
};

const deleteGaleri = async (id) => {
  const [result] = await pool.execute('DELETE FROM tb_galeri WHERE id_galeri = ?', [id]);
  
  if (result.affectedRows === 0) {
    throw new Error('Galeri tidak ditemukan');
  }

  return { message: 'Galeri berhasil dihapus' };
};

module.exports = {
  getAllGaleri,
  getGaleriById,
  getKategoriGaleri,
  getAllGaleriAdmin,
  createGaleri,
  updateGaleri,
  deleteGaleri
};
