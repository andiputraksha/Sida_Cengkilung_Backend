const { errorResponse } = require('../utils/response');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akses ditolak. Pengguna tidak terautentikasi.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Akses ditolak. Anda tidak memiliki izin.', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;