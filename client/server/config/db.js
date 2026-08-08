import mongoose from 'mongoose';

/**
 * Connect to MongoDB database via Mongoose ODM.
 * Dynamically resolves connection URI from process.env.MONGO_URI,
 * falling back to local MongoDB URL for development.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatapp';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Process exits on DB failure to prevent invalid app state
    process.exit(1);
  }
};
