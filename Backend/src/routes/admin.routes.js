import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
