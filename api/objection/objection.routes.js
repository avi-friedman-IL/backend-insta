import express from 'express';
import { getObjections, getObjection, addObjection, deleteObjection, updateObjection } from './objection.controller.js';

export const objectionRoutes = express.Router();

objectionRoutes.get('/', getObjections);
objectionRoutes.get('/:id', getObjection);
objectionRoutes.post('/', addObjection);
objectionRoutes.put('/:id', updateObjection);
objectionRoutes.delete('/:id', deleteObjection);
