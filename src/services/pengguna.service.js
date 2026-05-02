const db = require('../config/db');
const { hashPasswordBcrypt } = require('../utils/password'); // gunakan bcrypt, MD5 tidak dipakai lagi untuk penyimpanan baru

const getAllPengguna = async (role = null, search = '') => {
  try {
    const pool = db.pool;
    let query = `SELECT 
      id_pengguna, 
      nama_lengkap, 
      email, 
      role, 
      status_akun, 
      nomor_hp, 
      DATE_FORMAT(tanggal_daftar, '%d %M %Y %H:%i') as tanggal_daftar_formatted,
      DATE_FORMAT(terakhir_login, '%d %M %Y %H:%i') as terakhir_login_formatted
    FROM tb_pengguna`;
    
    const conditions = [];
    const params = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (search) {
      conditions.push('(nama_lengkap LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY tanggal_daftar DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error in getAllPengguna:', error);
    throw new Error('Gagal mengambil data pengguna');
  }
};

const getPenggunaById = async (id) => {
  try {
    const pool = db.pool;
    const [rows] = await pool.execute(
      `SELECT 
        id_pengguna, 
        nama_lengkap, 
        email, 
        role, 
        status_akun, 
        nomor_hp, 
        DATE_FORMAT(tanggal_daftar, '%d %M %Y %H:%i') as tanggal_daftar_formatted,
        DATE_FORMAT(terakhir_login, '%d %M %Y %H:%i') as terakhir_login_formatted,
        tanggal_daftar,
        terakhir_login
      FROM tb_pengguna WHERE id_pengguna = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    return rows[0];
  } catch (error) {
    console.error('Error in getPenggunaById:', error);
    throw new Error('Gagal mengambil detail pengguna');
  }
};

const createPengguna = async (penggunaData) => {
  try {
    const pool = db.pool;
    const {
      nama_lengkap,
      email,
      password,
      role = 'masyarakat',
      nomor_hp = null
    } = penggunaData;

    if (!nama_lengkap || !email || !password) {
      throw new Error('Nama lengkap, email, dan password harus diisi');
    }

    // Cek email sudah terdaftar
    const [existing] = await pool.execute(
      'SELECT id_pengguna FROM tb_pengguna WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    // Hash password dengan bcrypt
    const hashedPassword = await hashPasswordBcrypt(password);

    const [result] = await pool.execute(
      `INSERT INTO tb_pengguna (
        nama_lengkap, email, password, role, status_akun, nomor_hp, tanggal_daftar
      ) VALUES (?, ?, ?, ?, 'aktif', ?, NOW())`,
      [nama_lengkap, email, hashedPassword, role, nomor_hp]
    );

    return { 
      id: result.insertId,
      message: 'Pengguna berhasil dibuat',
      data: {
        nama_lengkap,
        email,
        role,
        status_akun: 'aktif'
      }
    };
  } catch (error) {
    console.error('Error in createPengguna:', error);
    throw error;
  }
};

const updatePengguna = async (id, penggunaData) => {
  try {
    const pool = db.pool;
    const {
      nama_lengkap,
      email,
      password,
      role,
      status_akun,
      nomor_hp
    } = penggunaData;

    // Cek user exists
    const [existingUser] = await pool.execute(
      'SELECT email FROM tb_pengguna WHERE id_pengguna = ?',
      [id]
    );

    if (existingUser.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    // Cek email sudah digunakan user lain
    if (email) {
      const [existing] = await pool.execute(
        'SELECT id_pengguna FROM tb_pengguna WHERE email = ? AND id_pengguna != ?',
        [email, id]
      );

      if (existing.length > 0) {
        throw new Error('Email sudah digunakan oleh pengguna lain');
      }
    }

    const updateFields = [];
    const values = [];

    if (nama_lengkap) { updateFields.push('nama_lengkap = ?'); values.push(nama_lengkap); }
    if (email) { updateFields.push('email = ?'); values.push(email); }
    if (password) {
      const hashedPassword = await hashPasswordBcrypt(password);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }
    if (role) { updateFields.push('role = ?'); values.push(role); }
    if (status_akun) { updateFields.push('status_akun = ?'); values.push(status_akun); }
    if (nomor_hp !== undefined) { updateFields.push('nomor_hp = ?'); values.push(nomor_hp); }

    values.push(id);

    const query = `UPDATE tb_pengguna SET ${updateFields.join(', ')} WHERE id_pengguna = ?`;
    
    const [result] = await pool.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal memperbarui pengguna');
    }

    return { 
      message: 'Pengguna berhasil diperbarui',
      changes: {
        id,
        fields_updated: updateFields.length
      }
    };
  } catch (error) {
    console.error('Error in updatePengguna:', error);
    throw error;
  }
};

const deletePengguna = async (id, currentUserId) => {
  try {
    const pool = db.pool;
    
    if (parseInt(id) === parseInt(currentUserId)) {
      throw new Error('Tidak dapat menghapus akun sendiri');
    }

    const [rows] = await pool.execute(
      'SELECT nama_lengkap, email FROM tb_pengguna WHERE id_pengguna = ?',
      [id]
    );
    
    if (rows.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const userData = rows[0];

    const [result] = await pool.execute(
      'DELETE FROM tb_pengguna WHERE id_pengguna = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Gagal menghapus pengguna');
    }

    return { 
      message: 'Pengguna berhasil dihapus',
      deleted_user: userData
    };
  } catch (error) {
    console.error('Error in deletePengguna:', error);
    throw error;
  }
};

const resetPassword = async (id, newPassword) => {
  try {
    const pool = db.pool;
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter');
    }

    const [user] = await pool.execute(
      'SELECT nama_lengkap, email FROM tb_pengguna WHERE id_pengguna = ?',
      [id]
    );

    if (user.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const hashedPassword = await hashPasswordBcrypt(newPassword);

    const [result] = await pool.execute(
      'UPDATE tb_pengguna SET password = ? WHERE id_pengguna = ?',
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Gagal mereset password');
    }

    // Untuk keamanan, jangan kembalikan password baru. Tampilkan hanya pesan sukses.
    return { 
      message: 'Password berhasil direset',
      user_id: id,
      user_name: user[0].nama_lengkap,
      user_email: user[0].email,
      note: 'Password baru telah direset oleh admin.'
    };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};

// Mock function untuk demo reset password requests (tidak diubah)
const getResetPasswordRequests = async () => {
  return [
    {
      id: 1,
      user_id: 2,
      user_name: "I Made Arya Putra",
      user_email: "arya@gmail.com",
      user_phone: "081222334455",
      requested_at: new Date().toISOString(),
      status: "pending",
      note: "Permintaan via WhatsApp"
    }
  ];
};

module.exports = {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
  resetPassword,
  getResetPasswordRequests
};