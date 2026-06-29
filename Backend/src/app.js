import express from 'express';
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimit.middleware.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Apply API rate limiter to all routes
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.json({ message: 'AI Code Reviewer API' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/projects', projectRoutes);
app.use('/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Server error',
  });
});

export default app;
