// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const bcrypt = require('bcryptjs'); // For password comparison (though handled by model method now)

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password, // Password will be hashed by the User model's pre-save hook
    role: role || 'candidate', // Default role if not provided
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  // .select('+password') is crucial because we set select: false in the schema
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get current user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) { // Should not happen if protect middleware is working
      res.status(401);
      throw new Error('Not authorized, user not found');
  }
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Update current user profile
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.location = req.body.location || user.location;
  user.qualification = req.body.qualification || user.qualification;
  user.experience = req.body.experience || user.experience;
  user.skills = req.body.skills || user.skills;

  // Password update (if provided)
  if (req.body.password && req.body.password.trim() !== '') {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json(user);
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
};