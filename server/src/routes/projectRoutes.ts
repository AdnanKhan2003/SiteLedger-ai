import express from 'express';
import { getProjects, createProject, getProjectById, updateProject } from '../controllers/projectController';

const router = express.Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);

export default router;
