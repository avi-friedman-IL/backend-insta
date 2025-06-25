import express from 'express';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';
import { getMsg, getMsgs, addMsg, deleteMsg, updateMsg } from './msg.controller.js';

export const msgRoutes = express.Router();

// middleware that is specific to this router
msgRoutes.use(requireAuth);

msgRoutes.get('/', getMsgs);
msgRoutes.get('/:id', getMsg);
msgRoutes.post('/', addMsg);
msgRoutes.put('/:id', updateMsg);
msgRoutes.delete('/:id', deleteMsg);
