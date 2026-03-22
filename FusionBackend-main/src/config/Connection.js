import mongoose from 'mongoose';

const Connection = async () => {
  try {
    if (!process.env.mongoConnectionString) {
      console.error('[DB] Missing mongoConnectionString environment variable');
      process.exit(1);
    }
    await mongoose.connect(process.env.mongoConnectionString);
    console.log('[DB] Connected to MongoDB Atlas successfully');
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

export default Connection;
