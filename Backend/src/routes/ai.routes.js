import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rateLimit.middleware.js';
import {
  getReview,
  getHistory,
  getReviewById,
  deleteReview,
  shareReview,
  getSharedReview,
  exportReview,
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/get-review', protect, reviewLimiter, getReview);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getReviewById);
router.delete('/history/:id', protect, deleteReview);
router.post('/share/:id', protect, shareReview);
router.get('/shared/:shareToken', getSharedReview);
router.get('/export/:id', protect, exportReview);

export default router;
