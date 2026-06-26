import User from '../models/user.model.js';
import Review from '../models/review.model.js';

export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewsToday = await Review.countDocuments({
      createdAt: { $gte: today },
    });

    const freeUsers = await User.countDocuments({ role: 'free' });
    const proUsers = await User.countDocuments({ role: 'pro' });

    // Top languages aggregation
    const topLanguages = await Review.aggregate([
      { $match: { language: { $ne: 'Unknown' } } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Average severity score
    const avgScoreResult = await Review.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$severityScore' } } },
    ]);
    const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    res.json({
      totalUsers,
      totalReviews,
      reviewsToday,
      freeUsers,
      proUsers,
      topLanguages,
      avgScore: Math.round(avgScore * 10) / 10,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['free', 'pro', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's reviews
    await Review.deleteMany({ userId: req.params.id });

    // Delete user
    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
