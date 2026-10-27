import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for auth endpoints: 25 requests per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', logout);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
