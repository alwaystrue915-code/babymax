import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used to maintain a cached connection across hot reloads in development.
 * In production (Vercel serverless), each function gets its own instance.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      // Serverless optimizations for Vercel
      maxPoolSize: 10, // Limit connections in serverless
      serverSelectionTimeoutMS: 5000, // Timeout quickly if MongoDB is unavailable
      socketTimeoutMS: 45000,
      // Additional serverless settings
      family: 4, // Use IPv4, skip IPv6 lookup (faster in serverless)
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
