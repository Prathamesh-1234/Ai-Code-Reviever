import Project from '../models/project.model.js';
import Review from '../models/review.model.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await Project.create({
      userId: req.user.id,
      name,
      description: description || '',
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort('-createdAt')
      .lean();

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Unset projectId on associated reviews
    await Review.updateMany({ projectId: project._id }, { $unset: { projectId: 1 } });

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
