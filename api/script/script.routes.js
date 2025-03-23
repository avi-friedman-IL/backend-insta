import express from 'express';
import { getScripts, getScript, addScript, deleteScript, updateScript } from './script.controller.js';
import { requireAdmin } from '../../middlewares/requireAuth.middleware.js';
export const scriptRoutes = express.Router();

scriptRoutes.get('/', getScripts);
scriptRoutes.get('/:id', getScript);
scriptRoutes.post('/', requireAdmin, addScript);
scriptRoutes.put('/:id', requireAdmin, updateScript);
scriptRoutes.delete('/:id', requireAdmin, deleteScript);
