// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db'); // Function to connect to DB
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

// Import routes
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
// Load environment variables from config/.env
dotenv.config({ path: './config/.env' });
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Basic route for root URL
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in development mode on port ${PORT}`.yellow.bold)
);