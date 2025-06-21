const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Delete a user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Change user role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  const { role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: 'Role updated' });
});

module.exports = router;