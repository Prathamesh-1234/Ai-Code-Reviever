import rateLimit from 'express-rate-limit';
import User from '../models/user.model.js';

// API rate limiter for public routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom review limiter middleware
export const reviewLimiter = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check and reset daily limit if needed
    user.checkAndResetDailyLimit();

    // Check if user has reached their limit
    if (user.role === 'free' && user.reviewsToday >= 10) {
      return res.status(429).json({
        error: 'Daily limit reached',
        limit: 10,
        used: user.reviewsToday,
      });
    }

    // Increment review count
    user.reviewsToday += 1;
    user.lastReviewDate = new Date();
    await user.save();

    next();
  } catch (error) {
    console.error('Review limiter error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
