import mongoose from 'mongoose';
import logger from './logger';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { bootstrapSuperAdmin } from './adminConfig';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (process.env.NODE_ENV === 'test' || (!mongoUri && process.env.NODE_ENV !== 'production') || process.env.USE_MEMORY_DB === 'true') {
    try {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      mongoUri = mongod.getUri();
      logger.info(`[DATABASE] Using in-memory MongoDB instance at ${mongoUri}`);
    } catch (err: any) {
      logger.warn(`[DATABASE] Could not start in-memory MongoDB: ${err.message}`);
    }
  }

  if (!mongoUri && process.env.NODE_ENV !== 'production') {
    mongoUri = 'mongodb://127.0.0.1:27017/cakepoprush';
  }

  if (!mongoUri) {
    throw new Error('[DATABASE FATAL] No MongoDB URI specified in production environment');
  }

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
  };

  try {
    logger.info(`[DATABASE] Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoUri, options);
    logger.info(`[DATABASE] Connected to MongoDB successfully`);
    await bootstrapSuperAdmin();
    return conn;
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      logger.error(`[DATABASE FATAL] Production MongoDB connection failed: ${err.message}`);
      throw err;
    }

    logger.warn(`[DATABASE] Direct MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer...`);
    try {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      mongoUri = mongod.getUri();
      const conn = await mongoose.connect(mongoUri, options);
      logger.info(`[DATABASE] Connected to fallback in-memory MongoDB successfully`);
      await bootstrapSuperAdmin();
      return conn;
    } catch (fallbackErr: any) {
      logger.error(`[DATABASE] Failed to connect to fallback database: ${fallbackErr.message}`);
      throw fallbackErr;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};

export default connectDB;
