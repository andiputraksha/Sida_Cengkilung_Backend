const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const login = async (req, res) => {
  try {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;  // email bisa diisi dengan email atau nomor HP

    if (!email || !password) {
      console.log('Validation failed - email or password missing');
      return errorResponse(res, 'Email/nomor HP dan password harus diisi');
    }

    console.log('Attempting login for identifier:', email);
    
    const result = await authService.login(email, password); // panggil service dengan identifier
    
    console.log('Login successful for user:', email);
    
    return successResponse(res, 'Login berhasil', result);
  } catch (error) {
    console.error('=== LOGIN CONTROLLER ERROR ===');
    console.error('Error message:', error.message);
    
    return errorResponse(res, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, 'Profile berhasil diambil', user);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Password saat ini dan password baru harus diisi');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal 6 karakter');
    }

    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    return successResponse(res, result.message);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const logout = async (req, res) => {
  try {
    return successResponse(res, 'Logout berhasil');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Email harus diisi');
    }

    return successResponse(res, 'Instruksi reset password telah dikirim', {
      message: 'Untuk reset password, hubungi Admin Desa:',
      admin_contact: {
        whatsapp: '082236624414',
        email: 'desaadatcengkilung@gmail.com',
        office_hours: 'Senin-Jumat: 08.00-15.00 WITA'
      },
      note: 'Admin akan memverifikasi identitas Anda sebelum mereset password'
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  logout,
  forgotPassword
};