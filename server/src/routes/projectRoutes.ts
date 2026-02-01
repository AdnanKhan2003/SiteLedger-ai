import express from 'express';
import { getProjects, createProject, getProjectById, updateProject, deleteProject } from '../controllers/projectController';

import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authPermission';

const router = express.Router();

// Protect all routes
// Protect all routes
router.use(authenticateToken);

// GET is allowed for all authenticated users (Controller filters)
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin Only Mutations
router.post('/', authorizeRoles('admin'), createProject);
router.put('/:id', authorizeRoles('admin'), updateProject);
router.delete('/:id', authorizeRoles('admin'), deleteProject);

export default router;
