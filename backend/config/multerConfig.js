// backend/config/multerConfig.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'backend/uploads/'); // Resumes will be stored in 'backend/uploads/'
  },
  filename: function(req, file, cb) {
    // Create a unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type (optional, but good for security)
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /pdf|doc|docx/; // Allow PDF, DOC, DOCX
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDFs and Word Docs only!');
  }
}

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;