const mongoose = require('mongoose');
require('dotenv').config();
const DB = process.env.DB;

const connectDB = async () => {
  try {
   mongoose.connect(process.env.DB);
    console.log('DB connected');
  } catch (error) {
    console.error(`Can't connect to DB: ${error.message}`);
  }
};

module.exports = connectDB;
