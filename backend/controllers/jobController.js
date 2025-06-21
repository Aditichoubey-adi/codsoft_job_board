const asyncHandler = require('express-async-handler');
const Job = require('../models/Job'); // Job model ko import karein
const User = require('../models/User'); // User model import kiya gaya hai (Ensure it's 'User' for consistency, not 'userModel' if your file is User.js)

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
// Renamed from createJob to postJob for consistency with route definition
const postJob = asyncHandler(async (req, res) => {
  // Check if user is logged in and is an employer
  if (!req.user || req.user.role !== 'employer') {
    res.status(401);
    throw new Error('Not authorized to post a job. Only employers can post jobs.');
  }

  const { title, company, location, salary, description, jobType } = req.body;

  if (!title || !company || !location || !description) {
    res.status(400);
    throw new Error('Please add all required fields: title, company, location, description');
  }

  const job = await Job.create({
    title,
    company,
    location,
    salary,
    description,
    jobType,
    user: req.user.id, // Job poster ka ID (logged-in employer)
  });

  res.status(201).json(job);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({}).sort({ createdAt: -1 }); // Naye jobs pehle dikhe
  res.status(200).json(jobs);
});

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my-jobs (Consistent with frontend and jobRoutes.js)
// @access  Private (Employer only)
// IMPORTANT: This function was previously not wrapped in asyncHandler and not exported.
const getEmployerJobs = asyncHandler(async (req, res) => {
  // req.user.id comes from the protect middleware, which authenticates the JWT and adds user to req
  const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 }); // Naye jobs pehle dikhe

  if (!jobs) { // Although it will return an empty array if no jobs, good to check
    return res.status(200).json([]); // Return empty array if no jobs found for employer
  }

  res.status(200).json(jobs);
});


// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only, owner of the job)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if user exists (comes from protect middleware)
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged-in user is the job owner
  if (job.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to update this job');
  }

  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // Return the updated document
  );

  res.status(200).json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only, owner of the job)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if user exists
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged-in user is the job owner
  if (job.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to delete this job');
  }

  await Job.findByIdAndDelete(req.params.id); // Correct way to delete
  res.status(200).json({ id: req.params.id, message: 'Job removed' });
});

// @desc    Get all jobs with filters, pagination, and sorting
// @route   GET /api/jobs/all
// @access  Public
const getAllJobs = async (req, res) => {
    try {
        let query = {};

        const {
            search,
            jobType,
            workLocation,
            experienceLevel,
            minSalary,
            maxSalary
        } = req.query;

        // 1. Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { company: { $regex: searchRegex } },
                { location: { $regex: searchRegex } }
            ];
        }

        // 2. Job Type filter
        if (jobType) {
            const types = Array.isArray(jobType) ? jobType : jobType.split(',');
            query.jobType = { $in: types };
        }

        // 3. Work Location filter
        if (workLocation) {
            const locations = Array.isArray(workLocation) ? workLocation : workLocation.split(',');
            query.workLocation = { $in: locations };
        }

        // 4. Experience Level filter
        if (experienceLevel) {
            const levels = Array.isArray(experienceLevel) ? experienceLevel : experienceLevel.split(',');
            query.experienceLevel = { $in: levels };
        }

        // 5. Salary Range filter
        if (minSalary || maxSalary) {
            query.$and = query.$and || [];
            if (minSalary) {
                query.$and.push({ maxSalary: { $gte: Number(minSalary) } });
            }
            if (maxSalary) {
                query.$and.push({ minSalary: { $lte: Number(maxSalary) } });
            }
        }

        // Pagination and Sorting
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'postedAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const jobs = await Job.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalJobs = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total: totalJobs,
            page,
            limit,
            jobs,
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
  postJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getAllJobs, 
};

exports.getJobById = getJobById;