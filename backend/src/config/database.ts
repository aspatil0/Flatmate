import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flatmate';
    
    // Connection pool configuration optimized for development/traditional server workload
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,           // Max concurrent connections (sufficient for development)
      minPoolSize: 2,            // Pre-warmed connections for faster operations
      socketTimeoutMS: 45000,    // 45s timeout for hanging queries
      connectTimeoutMS: 10000,   // 10s to establish connection
      serverSelectionTimeoutMS: 5000, // 5s to select a server
      maxIdleTimeMS: 300000,     // 5min before closing idle connections
      family: 4,                 // Force IPv4 to avoid DNS resolution issues
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Connection pool: minPoolSize=2, maxPoolSize=10');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
