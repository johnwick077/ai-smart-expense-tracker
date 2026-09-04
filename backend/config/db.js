const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_expense_tracker';
    
    // Set mongoose options
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    
    // Check if mongodb-memory-server is available for seamless local testing if external mongo is unavailable
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Attempting fallback to in-memory database for local development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[MongoDB Memory Server] Connected successfully to fallback database: ${uri}`);
        return conn;
      } catch (memError) {
        console.warn(`[MongoDB Memory Server] In-memory fallback not active: ${memError.message}`);
      }
    }
    
    console.warn('[MongoDB] Server will continue running, but database operations will fail until MongoDB is connected.');
  }
};

module.exports = connectDB;
