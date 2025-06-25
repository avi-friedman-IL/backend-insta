import express from 'express';
import { getObjections, getObjection, addObjection, deleteObjection, updateObjection } from './objection.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js';

export const objectionRoutes = express.Router();

// middleware that is specific to this router
objectionRoutes.use(requireAuth);

objectionRoutes.get('/', getObjections);
objectionRoutes.get('/:id', getObjection);
objectionRoutes.post('/', requireAdmin, addObjection);
objectionRoutes.put('/:id', requireAdmin, updateObjection);
objectionRoutes.delete('/:id', requireAdmin, deleteObjection);
