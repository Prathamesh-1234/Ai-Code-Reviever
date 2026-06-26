import { v4 as uuidv4 } from 'uuid';
import aiService from '../services/ai.service.js';
import Review from '../models/review.model.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';

// Detect language from code
const detectLanguage = (code) => {
  const codeLower = code.toLowerCase();
  if (codeLower.includes('import ') || codeLower.includes('export ') || codeLower.includes('const ') || codeLower.includes('let ') || codeLower.includes('function ')) {
    return 'JavaScript';
  }
  if (codeLower.includes('interface ') || codeLower.includes('type ') || codeLower.includes(': string') || codeLower.includes(': number')) {
    return 'TypeScript';
  }
  if (codeLower.includes('def ') || codeLower.includes('import ') || codeLower.includes('print(')) {
    return 'Python';
  }
  if (codeLower.includes('public class ') || codeLower.includes('public static void')) {
    return 'Java';
  }
  if (codeLower.includes('func ') || codeLower.includes('package ')) {
    return 'Go';
  }
  if (codeLower.includes('fn ') || codeLower.includes('let mut ') || codeLower.includes('impl ')) {
    return 'Rust';
  }
  if (codeLower.includes('#include') || codeLower.includes('int main(')) {
    return 'C++';
  }
  return 'Unknown';
};

// Parse AI response to extract metrics
const parseMetrics = (markdown) => {
  let severityScore = 50; // default
  let issueCount = { critical: 0, warning: 0, info: 0 };

  // Count issues by emoji markers
  const criticalMatches = markdown.match(/🔴|Critical|critical/gi) || [];
  const warningMatches = markdown.match(/🟡|Warning|warning/gi) || [];
  const infoMatches = markdown.match(/🔵|Info|info/gi) || [];

  issueCount.critical = Math.min(criticalMatches.length, 10);
  issueCount.warning = Math.min(warningMatches.length, 10);
  issueCount.info = Math.min(infoMatches.length, 10);

  // Calculate severity score (higher is better - fewer issues)
  const totalIssues = issueCount.critical * 3 + issueCount.warning * 2 + issueCount.info;
  severityScore = Math.max(0, Math.min(100, 100 - totalIssues * 5));

  return { severityScore, issueCount };
};

export const getReview = async (req, res, next) => {
  try {
    const { code, reviewProfile = 'general', projectId } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Get AI review
    const result = await aiService(code, reviewProfile);

    // Parse metrics from response
    const { severityScore, issueCount } = parseMetrics(result);

    // Detect language
    const language = detectLanguage(code);

    // Save review
    const review = await Review.create({
      userId: req.user.id,
      code,
      language,
      reviewProfile,
      result,
      severityScore,
      issueCount,
      projectId: projectId || null,
    });

    // Update user total reviews
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalReviews: 1 } });

    // Update project review count if projectId provided
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, { $inc: { reviewCount: 1 } });
    }

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, reviewProfile, sort = '-createdAt' } = req.query;

    const query = { userId: req.user.id };
    if (language) query.language = language;
    if (reviewProfile) query.reviewProfile = reviewProfile;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(query),
    ]);

    res.json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).lean();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this review' });
    }

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Decrement project review count if associated
    if (review.projectId) {
      await Project.findByIdAndUpdate(review.projectId, { $inc: { reviewCount: -1 } });
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const shareReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to share this review' });
    }

    if (!review.shareToken) {
      review.shareToken = uuidv4();
      review.isPublic = true;
      await review.save();
    }

    const shareUrl = `${process.env.CLIENT_URL}/shared/${review.shareToken}`;

    res.json({ shareToken: review.shareToken, shareUrl });
  } catch (error) {
    next(error);
  }
};

export const getSharedReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ shareToken: req.params.shareToken, isPublic: true }).lean();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

export const exportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to export this review' });
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=review-${review._id}.md`);
    res.send(review.result);
  } catch (error) {
    next(error);
  }
};
