// backend/models/jobModel.js

const mongoose = require('mongoose');

const jobSchema = mongoose.Schema(
  {
    user: { // The employer who posted the job
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Refers to the User model
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    location: {
      type: String,
      required: [true, 'Please add a job location'],
    },
    salary: {
      type: Number, // You can make this optional if needed
      required: [true, 'Please add a salary'],
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    // You can add more fields like:
    // responsibilities: [String],
    // qualifications: [String],
    // experienceLevel: { type: String, enum: [...] },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
module.exports = Job;