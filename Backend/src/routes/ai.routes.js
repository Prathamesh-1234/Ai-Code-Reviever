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
router.patch('/history/:id', protect, async (req, res, next) => {
  try {
    const { projectId } = req.body;
    
    // Validate projectId if provided
    if (projectId && typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const Review = (await import('../models/review.model.js')).default;
    
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { projectId: projectId || null },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Error updating review project:', error);
    next(error);
  }
});
export default router;
