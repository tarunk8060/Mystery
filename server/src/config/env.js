import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server root or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_characters_long_for_security_testing',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export function validateConfig() {
  const warnings = [];
  const errors = [];

  if (!process.env.JWT_SECRET && config.nodeEnv === 'production') {
    errors.push('JWT_SECRET must be explicitly set in production mode.');
  }

  if (!config.geminiApiKey) {
    warnings.push('GEMINI_API_KEY is not set. AI analysis calls will return a service unavailable error.');
  }

  if (!process.env.MONGODB_URI && config.nodeEnv === 'production') {
    errors.push('MONGODB_URI must be set in production mode.');
  }

  if (errors.length > 0) {
    console.error('Environment configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (config.nodeEnv === 'production') {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
  }

  if (warnings.length > 0 && config.nodeEnv !== 'test') {
    console.warn('Configuration warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  return { isValid: errors.length === 0, warnings, errors };
}
