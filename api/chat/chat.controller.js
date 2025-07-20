import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { chatService } from './chat.service.js'

export async function getChats(req, res) {
   const filterBy = req.query
   try {
      const chats = await chatService.query(filterBy)
      res.send(chats)
   } catch (err) {
      res.status(500).send({ err: 'Failed to get chats' })
   }
}

export async function getChatById(req, res) {
   try {
      const chat = await chatService.getById(req.params.id)
      res.send(chat)
   } catch (err) {
      logger.error('Failed to get chat', err)
      res.status(500).send({ err: 'Failed to get chat' })
   }
}

export async function addChat(req, res) {
   const chat = req.body
   const { loggedinUser } = req
   try {
      const addedChat = await chatService.add(chat)
      if (chat.groupUsers) {
         socketService.broadcast({
            type: 'chat-added',
            data: addedChat,
            userId: loggedinUser._id,
         })
      } else {
         socketService.emitToUser('chat-added', addedChat, chat.toId)
      }
      res.send(addedChat)
   } catch (err) {
      logger.error('Failed to add chat', err)
      res.status(500).send({ err: 'Failed to add chat' })
   }
}

export async function updateChat(req, res) {
   const chat = req.body
   const { loggedinUser } = req
   try {
      const updatedChat = await chatService.update(chat)
      socketService.broadcast({
         type: 'chat-updated',
         data: updatedChat,
         userId: loggedinUser._id,
      })
      res.send(updatedChat)
   } catch (err) {
      logger.error('Failed to update chat', err)
      res.status(500).send({ err: 'Failed to update chat' })
   }
}

export async function deleteChat(req, res) {
   const { loggedinUser } = req
   try {
      await chatService.remove(req.params.id)
      socketService.broadcast({
         type: 'chat-removed',
         data: req.params.id,
         userId: loggedinUser._id,
      })
      res.send({ msg: 'Chat deleted successfully' })
   } catch (err) {
      logger.error('Failed to delete chat', err)
      res.status(500).send({ err: 'Failed to delete chat' })
   }
}
