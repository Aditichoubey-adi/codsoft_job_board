// backend/controllers/applicationController.js
const asyncHandler = require('express-async-handler');
const Application = require('../models/Application'); // Application model import karein
const Job = require('../models/Job'); // Job model import karein (job ID validate karne ke liye)
const User = require('../models/User'); // User model import karein (optional, future use ke liye)

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (User only)
const applyForJob = asyncHandler(async (req, res) => {
  // req.user.id tabhi milega jab protect middleware laga ho
  const userId = req.user.id;
  const {
    jobId, // Frontend se aayega ki kis job ke liye apply kiya ja raha hai
    contactEmail,
    contactPhone,
    backgroundInfo,
    educationDetails,
    skills,
  } = req.body;

  // Resume file Multer se req.file mein hoga
  const resumePath = req.file ? req.file.path : null; // File ka local path

  // Input validation
  if (!jobId || !contactEmail || !contactPhone || !backgroundInfo || !educationDetails || !skills || !resumePath) {
    res.status(400);
    throw new Error('Please fill all required fields, including resume upload and skills.');
  }

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Skills string ko array mein convert karein agar comma-separated aati hai
  let skillsArray = [];
  if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(skill => skill.trim());
  } else if (Array.isArray(skills)) {
      skillsArray = skills.map(skill => skill.trim()); // Ensure trimming
  } else {
      res.status(400);
      throw new Error('Skills must be a comma-separated string or an array.');
  }

  // Create new application
  const application = await Application.create({
    job: jobId,
    applicant: userId,
    contactEmail,
    contactPhone,
    backgroundInfo,
    educationDetails,
    skills: skillsArray,
    resume: resumePath,
  });

  res.status(201).json({
    message: 'Application submitted successfully!',
    application,
  });
});

// @desc    Get all applications by a specific candidate
// @route   GET /api/applications/myapplications
// @access  Private (Candidate only)
const getCandidateApplications = asyncHandler(async (req, res) => {
  // Logic to fetch applications for the logged-in candidate
  // res.send('Get candidate applications route'); // Placeholder
  const applications = await Application.find({ applicant: req.user.id })
    .populate('job', 'title company location') // Job details bhi populate kar sakte hain
    .sort({ createdAt: -1 });

  res.status(200).json(applications);
});

// @desc    Get all applications for a specific job (for employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = asyncHandler(async (req, res) => {
  // Logic to fetch applications for a specific job ID
  // res.send(`Get applications for job ID: ${req.params.jobId} route`); // Placeholder
  const jobId = req.params.jobId;

  // Ensure the logged-in user is the owner of this job (optional but good security)
  const job = await Job.findById(jobId);
  if (!job || job.user.toString() !== req.user.id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view applications for this job');
  }

  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email') // Applicant details populate karein
    .sort({ createdAt: -1 });

  res.status(200).json(applications);
});


// @desc    Update application status (Employer only)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  // Logic to update application status
  // res.send(`Update application status for ID: ${req.params.id} route`); // Placeholder
  const { status } = req.body;
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId).populate('job');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Ensure the logged-in employer owns the job related to this application
  if (application.job.user.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this application');
  }

  // Validate status
  const allowedStatuses = ['Pending', 'Reviewed', 'Hired', 'Interview','Rejected'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid application status');
  }

  application.status = status;
  await application.save();

  res.status(200).json({ message: 'Application status updated', application });
});

// Middleware to check if user is authenticated
const protect = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  next();
};

module.exports = {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
  protect,
};