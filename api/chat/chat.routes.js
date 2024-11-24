import express from 'express';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';
import { getChat, getChats, addChat, deleteChat, updateChat } from './chat.controller.js';

export const chatRoutes = express.Router();

chatRoutes.get('/', getChats);
chatRoutes.get('/:id', getChat);
chatRoutes.post('/', addChat);
chatRoutes.put('/:id', updateChat);
chatRoutes.delete('/:id', deleteChat);
