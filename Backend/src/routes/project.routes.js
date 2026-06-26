import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', protect, getProjects);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
