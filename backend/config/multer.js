const multer = require('multer');
const path = require('path');

// Store file as buffer in memory for immediate streaming/parsing
const storage = multer.memoryStorage();

// Allowed MIME types & extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.json'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(null, true);
  }
  
  cb(new Error(`Unsupported file type: ${ext}. Supported formats are: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024 // Default 10MB
  },
  fileFilter
});

module.exports = upload;
