// backend/config/db.js
const mongoose = require('mongoose');
const colors = require('colors'); // Optional: for colored console output

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;