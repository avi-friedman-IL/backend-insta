import express from 'express';
import { requireTeamManager } from '../../middlewares/requireAuth.middleware.js';
import { getTraining, getTrainings, addTraining, deleteTraining, updateTraining } from './training.controller.js';

export const trainingRoutes = express.Router();

trainingRoutes.get('/', getTrainings);
trainingRoutes.get('/:id', getTraining);
trainingRoutes.post('/', requireTeamManager, addTraining);
trainingRoutes.put('/:id', requireTeamManager, updateTraining);
trainingRoutes.delete('/:id', requireTeamManager, deleteTraining);
