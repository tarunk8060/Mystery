import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let dbInitPromise = null;

export default async function handler(req, res) {
  if (!dbInitPromise) {
    dbInitPromise = connectDB().catch((err) => {
      console.warn('Database initialization warning in serverless function:', err.message);
    });
  }
  await dbInitPromise;
  return app(req, res);
}
