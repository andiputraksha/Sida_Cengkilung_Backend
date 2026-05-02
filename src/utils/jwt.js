const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id_pengguna,
      email: user.email,
      role: user.role,
      nama: user.nama_lengkap
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};