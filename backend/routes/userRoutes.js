// backend/routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;