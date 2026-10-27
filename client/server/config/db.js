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
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.warn(`MongoDB not reached (${error.message}). Activating in-memory store fallback.`);
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
