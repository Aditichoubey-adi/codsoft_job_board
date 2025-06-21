// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Path to your User model

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the Authorization header starting with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (split "Bearer" from the token string)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // THIS IS LINE 24 (or near it) where the error occurs

      // Get user from the token payload (decoded.id contains the user ID)
      req.user = await User.findById(decoded.id).select('-password'); // Attach user to request object

      next(); // Move to the next middleware/controller
    } catch (error) {
      console.error(error); // Log the actual JWT verification error for debugging
      res.status(401); // Unauthorized status
      throw new Error('Not authorized, token failed'); // Error message for client
    }
  }

  // If no token is found at all
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to check user roles (optional, but good for authorization)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized for this action' });
    }
    next();
  };
};

module.exports = { protect, adminOnly, authorizeRoles };