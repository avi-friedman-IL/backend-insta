import express from 'express';
import { requireAuth, requireTeamManager } from '../../middlewares/requireAuth.middleware.js';
import { getTraining, getTrainings, addTraining, deleteTraining, updateTraining } from './training.controller.js';

export const trainingRoutes = express.Router();

// middleware that is specific to this router
trainingRoutes.use(requireAuth);

trainingRoutes.get('/', getTrainings);
trainingRoutes.get('/:id', getTraining);
trainingRoutes.post('/', requireTeamManager, addTraining);
trainingRoutes.put('/:id', requireTeamManager, updateTraining);
trainingRoutes.delete('/:id', requireTeamManager, deleteTraining);
