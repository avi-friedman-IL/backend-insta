import express from 'express';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';
import { getTemplate, getTemplates, addTemplate, deleteTemplate, updateTemplate } from './template.controller.js';

export const templateRoutes = express.Router();

templateRoutes.get('/', getTemplates);
templateRoutes.get('/:id', getTemplate);
templateRoutes.post('/', addTemplate);
templateRoutes.put('/:id', updateTemplate);
templateRoutes.delete('/:id', deleteTemplate);
