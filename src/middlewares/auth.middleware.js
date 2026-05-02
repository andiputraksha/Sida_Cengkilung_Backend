const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, 'Token tidak valid atau telah kadaluarsa.', 401);
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;