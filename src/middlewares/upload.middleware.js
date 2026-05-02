const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function untuk memastikan direktori ada
const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Konfigurasi storage dengan memory storage untuk fleksibilitas
// Karena kita perlu menangani file dari berbagai field name
const storage = multer.memoryStorage();

// File filter untuk validasi tipe file
const fileFilter = (req, file, cb) => {
  // Tipe file yang diizinkan
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'video/mp4': true,
    'video/mpeg': true
  };

  // Untuk permohonan dokumen, kita izinkan file pendukung
  if (file.fieldname === 'lampiran_berkas') {
    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, JPEG, PNG'), false);
    }
  } 
  // Untuk upload dokumen umum
  else if (file.fieldname === 'file') {
    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, JPEG, PNG'), false);
    }
  }
  else {
    cb(null, true);
  }
};

// Middleware upload dengan konfigurasi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware untuk menyimpan file ke disk setelah upload
const saveUploadedFile = async (file, uploadType = 'general') => {
  if (!file || !file.buffer) {
    return null;
  }

  try {
    // Tentukan path upload berdasarkan tipe
    let uploadPath = '';
    if (uploadType === 'permohonan') {
      uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'permohonan');
    } else if (uploadType === 'dokumen') {
      uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'dokumen');
    } else {
      uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', uploadType);
    }

    // Buat direktori jika belum ada
    ensureDirectory(uploadPath);

    // Generate nama file unik
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}_${timestamp}_${random}${fileExtension}`;
    const filePath = path.join(uploadPath, fileName);

    // Simpan file ke disk
    fs.writeFileSync(filePath, file.buffer);

    // Return path relatif untuk disimpan di database
    const relativePath = path.join(uploadType === 'permohonan' ? 'uploads/permohonan' : 
                                    uploadType === 'dokumen' ? 'uploads/dokumen' : 
                                    `uploads/${uploadType}`, fileName);
    
    return relativePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Gagal menyimpan file');
  }
};

// Middleware untuk menangani upload error
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  saveUploadedFile,
  handleUploadError
};