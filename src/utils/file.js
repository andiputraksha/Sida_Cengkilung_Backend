const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const ensureDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const generateBackupFileName = (prefix = 'backup') => {
  const timestamp = moment().format('YYYYMMDD_HHmmss');
  return `${prefix}_${timestamp}.sql`;
};

module.exports = {
  ensureDirectory,
  deleteFile,
  generateBackupFileName
};