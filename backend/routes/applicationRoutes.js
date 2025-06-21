// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const {authorizeRoles } = require('../middleware/authMiddleware');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Resume upload ke liye

const {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// @route   POST /api/applications
// @desc    Apply for a job (Candidate only, with resume upload)
// @access  Private (Candidate)
router.post(
  '/',
  protect,
  authorizeRoles('candidate'),
  upload.single('resume'),
  applyForJob
);

// @route   GET /api/applications/myapplications
// @desc    Get all applications by a specific candidate
// @access  Private (Candidate only)
router.get('/myapplications', protect, authorizeRoles('candidate'), getCandidateApplications);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job (for employer)
// @access  Private (Employer only)
router.get('/job/:jobId', protect, authorizeRoles('employer'), getJobApplications);

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Employer only)
// @access  Private (Employer only)
router.put('/:id/status', protect, authorizeRoles('employer'), updateApplicationStatus);


module.exports = router;

// app.js ya server.js me:
// app.use('/api/applications', applicationRoutes);