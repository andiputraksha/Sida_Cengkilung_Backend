const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { verifyPassword, hashPasswordBcrypt, isBcryptHash } = require('../utils/password');

const login = async (identifier, password) => {
  try {
    const pool = db.pool;

    // Cari user berdasarkan email atau nomor HP
    const [rows] = await pool.execute(
      'SELECT * FROM tb_pengguna WHERE email = ? OR nomor_hp = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      throw new Error('Email/nomor HP atau password salah');
    }

    const user = rows[0];

    // Cek status akun
    if (user.status_akun === 'nonaktif') {
      throw new Error('Akun dinonaktifkan. Hubungi administrator di 082236624414.');
    }

    // Verifikasi password (mendukung MD5 dan bcrypt)
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email/nomor HP atau password salah');
    }

    // **Jika password masih MD5, upgrade ke bcrypt**
    if (!isBcryptHash(user.password)) {
      const bcryptHash = await hashPasswordBcrypt(password);
      await pool.execute(
        'UPDATE tb_pengguna SET password = ? WHERE id_pengguna = ?',
        [bcryptHash, user.id_pengguna]
      );
      console.log(`Password upgraded to bcrypt for user ID: ${user.id_pengguna}`);
    }

    // Update last login
    await pool.execute(
      'UPDATE tb_pengguna SET terakhir_login = NOW() WHERE id_pengguna = ?',
      [user.id_pengguna]
    );

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id_pengguna,
        nama: user.nama_lengkap,
        email: user.email,
        role: user.role,
        nomor_hp: user.nomor_hp
      }
    };
  } catch (error) {
    console.error('Login service error:', error);
    throw new Error(error.message);
  }
};

const getProfile = async (userId) => {
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
        DATE_FORMAT(tanggal_daftar, '%d %M %Y') as tanggal_daftar_formatted,
        DATE_FORMAT(terakhir_login, '%d %M %Y %H:%i') as terakhir_login_formatted,
        tanggal_daftar,
        terakhir_login
      FROM tb_pengguna WHERE id_pengguna = ?`,
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    return rows[0];
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error('Gagal mengambil profil pengguna');
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const pool = db.pool;
    const [rows] = await pool.execute(
      'SELECT password FROM tb_pengguna WHERE id_pengguna = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('Pengguna tidak ditemukan');
    }

    const user = rows[0];

    // Verifikasi current password (gunakan verifyPassword yang sudah mendukung kedua format)
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Password saat ini salah');
    }

    // Hash password baru dengan bcrypt
    const hashedNewPassword = await hashPasswordBcrypt(newPassword);

    await pool.execute(
      'UPDATE tb_pengguna SET password = ? WHERE id_pengguna = ?',
      [hashedNewPassword, userId]
    );

    return { message: 'Password berhasil diubah' };
  } catch (error) {
    console.error('Change password error:', error);
    throw new Error('Gagal mengubah password');
  }
};

module.exports = {
  login,
  getProfile,
  changePassword
};