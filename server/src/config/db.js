import mongoose from 'mongoose';
import { config } from './env.js';
import { activateInMemoryFallback, inMemoryStore } from './memoryStore.js';

let isConnected = false;

export async function connectDB(customUri = null) {
  const uri = customUri || config.mongoUri;

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    if (config.nodeEnv === 'production') {
      console.error(`MongoDB Connection Error: ${error.message}`);
      throw error;
    }

    // In development mode, automatically activate in-memory database store
    console.warn(`Local MongoDB not detected (${error.message}).`);
    activateInMemoryFallback();
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1 || inMemoryStore.isFallbackActive;
}
