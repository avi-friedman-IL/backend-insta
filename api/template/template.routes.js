import express from 'express';
import { requireAdmin } from '../../middlewares/requireAuth.middleware.js';
import { getTemplate, getTemplates, addTemplate, deleteTemplate, updateTemplate } from './template.controller.js';

export const templateRoutes = express.Router();

templateRoutes.get('/', getTemplates);
templateRoutes.get('/:id', getTemplate);
templateRoutes.post('/', requireAdmin, addTemplate);
templateRoutes.put('/:id', requireAdmin, updateTemplate);
templateRoutes.delete('/:id', requireAdmin, deleteTemplate);
