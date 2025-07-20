import express from 'express'
import { getChats, getChatById, addChat, updateChat, deleteChat } from './chat.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';

export const chatRoutes = express.Router()

chatRoutes.get('/', requireAuth, getChats)
chatRoutes.get('/:id', requireAuth, getChatById)
chatRoutes.post('/', requireAuth, addChat)
chatRoutes.put('/:id', requireAuth, updateChat)
chatRoutes.delete('/:id', requireAuth, deleteChat)

