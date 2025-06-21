// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Email must be unique
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Basic email regex validation
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6, // Minimum password length
      select: false, // Don't return password in query results by default
    },
    role: {
      type: String,
      enum: ['candidate', 'employer'], // Users can be either candidates or employers
      default: 'candidate',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    location: { type: String },
    qualification: { type: String },
    experience: { type: String },
    skills: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);