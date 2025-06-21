// backend/models/Job.js
const mongoose = require('mongoose');
console.log('Loading Job Model from:', __filename);

// If the Job model already exists, explicitly delete it from Mongoose's cache
// This is a common workaround for stubborn model caching during development
if (mongoose.models.Job) {
  delete mongoose.models.Job;
}

const jobSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId, // Link to the employer who posted the job
      ref: 'User', // Refers to the User model
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    // --- SALARY FIELD CHANGE ---
    // Instead of single 'salary' string, using minSalary and maxSalary Numbers for range filtering
    minSalary: {
      type: Number,
      min: 0, // Salary cannot be negative
      required: false, // Make it optional if job might not specify salary
    },
    maxSalary: {
      type: Number,
      min: 0,
      required: false, // Make it optional
      // Optional validation: maxSalary should be greater than or equal to minSalary
      // validate: {
      //     validator: function(v) {
      //         return this.minSalary === undefined || v >= this.minSalary;
      //     },
      //     message: props => `Max salary (${props.value}) must be greater than or equal to Min salary!`
      // }
    },
    // --- END SALARY FIELD CHANGE ---

    company: {
      type: String,
      required: [true, 'Please add company name'],
    },
    // --- JOB TYPE FIELD CHANGE ---
    // Changed from [String] to String with enum for single selection and better validation
    jobType: {
      type: String, // Changed to String
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], // Allowed values
      required: [true, 'Please add job type'], // Making it required
      default: 'Full-time' // Default value for new jobs
    },
    // --- END JOB TYPE FIELD CHANGE ---

    // --- NEW FIELD: WORK LOCATION ---
    workLocation: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      required: [true, 'Please add work location type'],
      default: 'On-site'
    },
    // --- END NEW FIELD ---

    // --- NEW FIELD: EXPERIENCE LEVEL ---
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior', 'Director', 'Executive'],
      required: [true, 'Please add experience level'],
      default: 'Entry-level'
    },
    // --- END NEW FIELD ---

    applicationDeadline: {
      type: Date,
      required: false, // Deadline can be optional
    },
    qualification: { type: String },
    responsibility: { type: String }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Define the model using the schema
const Job = mongoose.model('Job', jobSchema);

// --- KEEP THIS CONSOLE.LOG ---
console.log('Job Model loaded. JobType schema type:', Job.schema.paths.jobType.instance);
// --- END CONSOLE.LOG ---

module.exports = Job;