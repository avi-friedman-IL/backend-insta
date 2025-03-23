import express from 'express';
import { getObjections, getObjection, addObjection, deleteObjection, updateObjection } from './objection.controller.js';
import { requireAdmin } from '../../middlewares/requireAuth.middleware.js';

export const objectionRoutes = express.Router();

objectionRoutes.get('/', getObjections);
objectionRoutes.get('/:id', getObjection);
objectionRoutes.post('/', requireAdmin, addObjection);
objectionRoutes.put('/:id', requireAdmin, updateObjection);
objectionRoutes.delete('/:id', requireAdmin, deleteObjection);
