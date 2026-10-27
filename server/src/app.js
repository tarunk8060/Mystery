import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { isDbConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Avoid blocking inline scripts or assets on Vercel
}));

// CORS Configuration - Permissive for both local development and Vercel domains
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    application: 'AI Mystery Room Backend API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    geminiConfigured: Boolean(config.geminiApiKey),
    geminiModel: config.geminiModel,
    dbConnected: isDbConnected(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Feature Routers (supports both /api/auth and /auth)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/cases', '/cases'], caseRoutes);

// Catch-all 404 handler for unknown API routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`API route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
