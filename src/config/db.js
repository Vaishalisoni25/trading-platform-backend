const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/algo_trading_platform';
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.log('[MongoDB] If you are using local MongoDB, ensure mongod service is running.');
    console.log('[MongoDB] If using MongoDB Atlas, update MONGO_URI in .env');
    // Note: In development, don't crash the server so other routes/healthcheck can still be inspected
  }
};

module.exports = connectDB;
