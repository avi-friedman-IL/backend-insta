import express from 'express';
import { getScripts, getScript, addScript, deleteScript, updateScript } from './script.controller.js';

export const scriptRoutes = express.Router();

scriptRoutes.get('/', getScripts);
scriptRoutes.get('/:id', getScript);
scriptRoutes.post('/', addScript);
scriptRoutes.put('/:id', updateScript);
scriptRoutes.delete('/:id', deleteScript);
