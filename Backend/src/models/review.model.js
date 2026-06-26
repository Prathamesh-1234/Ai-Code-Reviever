import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'Unknown',
    },
    reviewProfile: {
      type: String,
      enum: ['general', 'security', 'performance', 'style', 'beginner'],
      default: 'general',
    },
    result: {
      type: String,
      required: true,
    },
    severityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    issueCount: {
      critical: {
        type: Number,
        default: 0,
      },
      warning: {
        type: Number,
        default: 0,
      },
      info: {
        type: Number,
        default: 0,
      },
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
