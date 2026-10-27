import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
} from '../controllers/caseController.js';
import {
  addSuspect,
  updateSuspect,
  deleteSuspect,
} from '../controllers/suspectController.js';
import {
  addClue,
  updateClue,
  deleteClue,
} from '../controllers/clueController.js';
import {
  runAnalysis,
  getLatestAnalysis,
  getAnalysisHistory,
  sendChatMessage,
  getChatHistory,
  getCaseReport,
} from '../controllers/analysisController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for AI analysis and interrogation endpoints: 30 requests per 15 min
const aiEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'AI Detective analysis rate limit reached. Please wait before submitting more queries.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All case routes require authentication
router.use(authenticateToken);

// Case CRUD
router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.patch('/:id', updateCase);
router.delete('/:id', deleteCase);

// Suspects
router.post('/:id/suspects', addSuspect);
router.patch('/:id/suspects/:suspectId', updateSuspect);
router.delete('/:id/suspects/:suspectId', deleteSuspect);

// Clues
router.post('/:id/clues', addClue);
router.patch('/:id/clues/:clueId', updateClue);
router.delete('/:id/clues/:clueId', deleteClue);

// AI Detective Analysis & Chat
router.post('/:id/analyze', aiEndpointsLimiter, runAnalysis);
router.get('/:id/analysis', getLatestAnalysis);
router.get('/:id/analysis/history', getAnalysisHistory);
router.post('/:id/chat', aiEndpointsLimiter, sendChatMessage);
router.get('/:id/chat', getChatHistory);
router.get('/:id/report', getCaseReport);

export default router;
