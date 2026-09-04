const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_expense_tracker';
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to MongoDB at ${mongoUri}. (${error.message})`);
    console.warn('[MongoDB] To persist data, ensure MongoDB is running locally or set your MongoDB Atlas URI in backend/.env.');
  }
};

module.exports = connectDB;
