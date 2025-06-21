const express = require('express');
const router = express.Router();

// Import all necessary controller functions from jobController
const {
  postJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs, // Ensure this name matches your controller's export
  getAllJobs, // Import the new controller function
} = require('../controllers/jobController');

// Import authentication and authorization middleware from authMiddleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
// --- PUBLIC ROUTES (accessible to everyone) ---

// Route to get all jobs (e.g., for the main job listing page)
router.get('/', getJobs);

// Route to get all jobs (newly added route)
router.get('/jobs', getAllJobs);

// IMPORTANT: The '/my-jobs' route MUST come BEFORE the '/:id' route.
// If '/:id' comes first, Express will try to interpret "my-jobs" as a job ID,
// leading to the "Cast to ObjectId failed" error we saw previously.
router.get('/my-jobs', protect, authorizeRoles('employer'), getEmployerJobs); // Get jobs posted by the logged-in employer

// Route to get a single job by its ID
router.get('/:id', getJobById);


// --- PRIVATE ROUTES (Require authentication and specific roles) ---

// Route for employers to post a new job
router.post('/', protect, authorizeRoles('employer'), postJob);

// Routes for employers to update their own jobs by ID
router.put('/:id', protect, authorizeRoles('employer'), updateJob);

// Routes for employers to delete their own jobs by ID
router.delete('/:id', protect, authorizeRoles('employer'), deleteJob);

module.exports = router;