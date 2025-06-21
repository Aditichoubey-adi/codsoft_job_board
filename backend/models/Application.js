// backend/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.ObjectId,
      ref: 'Job', // Kis job ke liye apply kiya gaya hai
      required: true,
    },
    applicant: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Kis user ne apply kiya hai
      required: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide your contact email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email address',
      ],
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide your contact phone number'],
    },
    backgroundInfo: { // Jaise aapka background kya hai (general text)
      type: String,
      required: [true, 'Please tell us about your background'],
    },
    educationDetails: { // Graduation details, field, etc.
      type: String,
      required: [true, 'Please provide your educational details'],
    },
    skills: { // Skills array
      type: [String],
      required: [true, 'Please list your skills'],
    },
    resume: { // Resume file ka path/URL
      type: String,
      required: [true, 'Please upload your resume'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Interview', 'Rejected', 'Hired'], // <-- yahan add karo
      default: 'Pending',
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt fields automatically add karega
  }
);

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
module.exports = Application;