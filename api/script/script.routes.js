import express from 'express';
import { getScripts, getScript, addScript, deleteScript, updateScript } from './script.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js';
export const scriptRoutes = express.Router();

// middleware that is specific to this router
scriptRoutes.use(requireAuth);

scriptRoutes.get('/', getScripts);
scriptRoutes.get('/:id', getScript);
scriptRoutes.post('/', requireAdmin, addScript);
scriptRoutes.put('/:id', requireAdmin, updateScript);
scriptRoutes.delete('/:id', requireAdmin, deleteScript);
