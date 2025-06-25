import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js';
import { getTemplate, getTemplates, addTemplate, deleteTemplate, updateTemplate } from './template.controller.js';

export const templateRoutes = express.Router();

// middleware that is specific to this router
templateRoutes.use(requireAuth);

templateRoutes.get('/', getTemplates);
templateRoutes.get('/:id', getTemplate);
templateRoutes.post('/', requireAdmin, addTemplate);
templateRoutes.put('/:id', requireAdmin, updateTemplate);
templateRoutes.delete('/:id', requireAdmin, deleteTemplate);
