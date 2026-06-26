import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['free', 'pro', 'admin'],
      default: 'free',
    },
    reviewsToday: {
      type: Number,
      default: 0,
    },
    lastReviewDate: {
      type: Date,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check and reset daily limit
userSchema.methods.checkAndResetDailyLimit = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastReviewDate || this.lastReviewDate < today) {
    this.reviewsToday = 0;
    this.lastReviewDate = today;
  }

  return this.reviewsToday;
};

const User = mongoose.model('User', userSchema);

export default User;
