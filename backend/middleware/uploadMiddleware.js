// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads directory check karein, agar nahi hai toh banayein
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Files ko 'backend/uploads/resumes' folder mein store karein
  },
  filename: (req, file, cb) => {
    // Unique filename banayein taaki conflicts na hon (e.g., user-timestamp-filename.pdf)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Original filename se extension len (e.g., .pdf, .docx)
    const fileExtension = path.extname(file.originalname);
    // Final filename: userId-timestamp-randomnumber.extension
    // Yahan hum req.user.id use kar rahe hain, isliye yeh middleware protect middleware ke baad aana chahiye
    // CORRECTED LINE BELOW:
    const filename = `${req.user ? req.user.id + '-' : ''}${uniqueSuffix}${fileExtension}`; // <<< CORRECTED THIS LINE
    cb(null, filename);
  }
});

// File filter to allow only specific file types (PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /pdf|doc|docx/; // Regex for allowed extensions
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Max file size 5MB (optional, adjust as needed)
  }
});

module.exports = upload;