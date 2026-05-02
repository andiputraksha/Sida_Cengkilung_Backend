const pendudukService = require('../services/penduduk.service');
const { successResponse, errorResponse } = require('../utils/response');
// Import pool di atas, bukan di dalam function
const db = require('../config/db'); // Pastikan ini mengekspor pool yang benar

const getAllPenduduk = async (req, res) => {
  try {
    const filters = req.query;
    const data = await pendudukService.getAllPenduduk(filters);
    return successResponse(res, 'Data penduduk berhasil diambil', data);
  } catch (error) {
    console.error('Error in getAllPenduduk:', error);
    return errorResponse(res, error.message);
  }
};

const getPendudukById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await pendudukService.getPendudukById(id);
    return successResponse(res, 'Detail penduduk berhasil diambil', data);
  } catch (error) {
    console.error('Error in getPendudukById:', error);
    return errorResponse(res, error.message);
  }
};

const createPenduduk = async (req, res) => {
  try {
    const pendudukData = req.body;
    
    // Validation
    if (!pendudukData.nik || !pendudukData.nama || !pendudukData.jenis_kelamin || !pendudukData.tanggal_lahir) {
      return errorResponse(res, 'NIK, nama, jenis kelamin, dan tanggal lahir harus diisi');
    }

    if (pendudukData.nik.length !== 16) {
      return errorResponse(res, 'NIK harus 16 digit');
    }

    // Cek apakah NIK sudah ada
    const [existing] = await db.pool.execute(
      'SELECT id_penduduk FROM tb_penduduk WHERE nik = ?',
      [pendudukData.nik]
    );

    if (existing.length > 0) {
      return errorResponse(res, 'NIK sudah terdaftar');
    }

    const result = await pendudukService.createPenduduk(pendudukData);

    // Log aktivitas - HAPUS atau COMMENT dulu karena tabel belum ada
    // if (db.pool) {
    //   try {
    //     await db.pool.execute(
    //       'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
    //       [req.user?.id || 1, 'CREATE_PENDUDUK', `Menambah penduduk: ${pendudukData.nama}`]
    //     );
    //   } catch (logError) {
    //     console.warn('Log aktivitas gagal:', logError.message);
    //   }
    // }

    return successResponse(res, 'Penduduk berhasil ditambahkan', result, 201);
  } catch (error) {
    console.error('Error in createPenduduk:', error);
    return errorResponse(res, error.message);
  }
};

const updatePenduduk = async (req, res) => {
  try {
    const { id } = req.params;
    const pendudukData = req.body;

    if (pendudukData.nik && pendudukData.nik.length !== 16) {
      return errorResponse(res, 'NIK harus 16 digit');
    }

    // Cek apakah data ada
    const [existing] = await db.pool.execute(
      'SELECT id_penduduk FROM tb_penduduk WHERE id_penduduk = ?',
      [id]
    );

    if (existing.length === 0) {
      return errorResponse(res, 'Data penduduk tidak ditemukan');
    }

    // Jika NIK diubah, cek apakah NIK baru sudah digunakan
    if (pendudukData.nik) {
      const [nikCheck] = await db.pool.execute(
        'SELECT id_penduduk FROM tb_penduduk WHERE nik = ? AND id_penduduk != ?',
        [pendudukData.nik, id]
      );

      if (nikCheck.length > 0) {
        return errorResponse(res, 'NIK sudah digunakan oleh penduduk lain');
      }
    }

    const result = await pendudukService.updatePenduduk(id, pendudukData);

    // Log aktivitas - COMMENT dulu
    // if (db.pool) {
    //   try {
    //     await db.pool.execute(
    //       'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
    //       [req.user?.id || 1, 'UPDATE_PENDUDUK', `Memperbarui penduduk ID: ${id}`]
    //     );
    //   } catch (logError) {
    //     console.warn('Log aktivitas gagal:', logError.message);
    //   }
    // }

    return successResponse(res, result.message);
  } catch (error) {
    console.error('Error in updatePenduduk:', error);
    return errorResponse(res, error.message);
  }
};

const deletePenduduk = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah data ada
    const [existing] = await db.pool.execute(
      'SELECT id_penduduk FROM tb_penduduk WHERE id_penduduk = ?',
      [id]
    );

    if (existing.length === 0) {
      return errorResponse(res, 'Data penduduk tidak ditemukan');
    }

    const result = await pendudukService.deletePenduduk(id);

    // Log aktivitas - COMMENT dulu
    // if (db.pool) {
    //   try {
    //     await db.pool.execute(
    //       'INSERT INTO tb_log_aktivitas (id_pengguna, aktivitas, detail) VALUES (?, ?, ?)',
    //       [req.user?.id || 1, 'DELETE_PENDUDUK', `Menghapus penduduk ID: ${id}`]
    //     );
    //   } catch (logError) {
    //     console.warn('Log aktivitas gagal:', logError.message);
    //   }
    // }

    return successResponse(res, result.message);
  } catch (error) {
    console.error('Error in deletePenduduk:', error);
    return errorResponse(res, error.message);
  }
};

const exportPenduduk = async (req, res) => {
  try {
    const filters = req.query;
    const data = await pendudukService.exportPenduduk(filters);

    // Set headers untuk download CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=penduduk_${new Date().toISOString().split('T')[0]}.csv`);

    // Buat CSV string
    let csvContent = data.headers.join(',') + '\n';
    data.rows.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    return res.send(csvContent);
  } catch (error) {
    console.error('Error in exportPenduduk:', error);
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getAllPenduduk,
  getPendudukById,
  createPenduduk,
  updatePenduduk,
  deletePenduduk,
  exportPenduduk
};