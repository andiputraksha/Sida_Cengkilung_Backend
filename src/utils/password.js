const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Cek apakah hash dalam format bcrypt (diawali $2a$, $2b$, $2y$)
const isBcryptHash = (hash) => {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
};

// Verifikasi password: mendukung MD5 dan bcrypt
const verifyPassword = async (inputPassword, storedHash) => {
  if (isBcryptHash(storedHash)) {
    // bcrypt verification
    return await bcrypt.compare(inputPassword, storedHash);
  } else {
    // MD5 verification (asumsi storedHash adalah MD5)
    const md5Hash = crypto.createHash('md5').update(inputPassword).digest('hex');
    return md5Hash === storedHash;
  }
};

// Hash password dengan bcrypt (untuk pengguna baru atau upgrade)
const hashPasswordBcrypt = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Hash MD5 (masih diperlukan untuk keperluan tertentu, tapi tidak untuk simpan baru)
const hashPasswordMD5 = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

module.exports = {
  verifyPassword,
  hashPasswordBcrypt,
  hashPasswordMD5,
  isBcryptHash
};