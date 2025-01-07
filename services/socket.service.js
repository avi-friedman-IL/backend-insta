import { chatService } from '../api/chat/chat.service.js'
import { logger } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(http) {
   gIo = new Server(http, {
      cors: {
         origin: '*',
      },
   })
   // Handling new socket connections
   gIo.on('connect', socket => {
      logger.info(`New connected socket [id: ${socket.id}]`)

      socket.on('disconnect', () => {
         logger.info(`Socket [id: ${socket.id}] disconnected`)
         delete socket.userId
      })

      socket.on('typing', ({ toUserId, fromUserId, toGroupId }) => {
         gIo.emit('typing', { toUserId, fromUserId, toGroupId })
      })

      socket.on('offTyping', () => {
         gIo.emit('offTyping')
      })

      socket.on('updateLoggedUser', user => {
         gIo.emit('updateLoggedUser', user)
         logger.info(`User ${user._id} updated`)
      })

      socket.on('joinGroup', groupId => {
         socket.join(`group:${groupId}`)
         socket.toGroupId = groupId
         logger.info(`Socket ${socket.id} joined group:${groupId}`)
         _printSockets()
      })

      socket.on('login', userId => {
         socket.userId = userId
         gIo.emit('login', userId)
         logger.info(`Socket ${socket.id} logged in with userId: ${userId}`)
      })

      socket.on('chat-add', async chat => {
         const toUserSocket = await _getUserSocket(chat.toUserId)
         const fromUserSocket = await _getUserSocket(chat.fromUserId)

         if (chat.toGroupId) {
            socket.join(`group:${chat.toGroupId}`)
            gIo.to(`group:${chat.toGroupId}`).emit('chat-add', chat)
            logger.info(`Emitting chat to group:${chat.toGroupId}`)
         } else {
            if (!toUserSocket && !fromUserSocket) return
            if (chat.toUserId === chat.fromUserId) {
               // Handle self messages
               if (fromUserSocket) {
                  fromUserSocket.emit('chat-add', chat)
               }
            } else if (toUserSocket) {
               toUserSocket.emit('chat-add', chat)
            }
            if (fromUserSocket) {
               fromUserSocket.emit('chat-add', chat)
            }
         }
         chatService.add(chat)
      })
   })
}

// Emit an event to all users or users watching a specific label
function emitTo({ type, data, label }) {
   if (label) gIo.to('watching:' + label.toString()).emit(type, data)
   else gIo.emit(type, data)
}

// Emit an event to a specific user
async function emitToUser({ type, data, userId }) {
   userId = userId.toString()
   const socket = await _getUserSocket(userId)
   if (socket) {
      logger.info(
         `Emitting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
      )
      socket.emit(type, data)
   } else {
      logger.info(`No active socket for user: ${userId}`)
   }
}

// Broadcast an event to a room or all users, excluding a specific user if needed
async function broadcast({ type, data, room = null, userId }) {
   userId ? (userId = userId.toString()) : null
   logger.info(`Broadcasting event: ${type}`)
   const excludedSocket = await _getUserSocket(userId)
   // const excludedSocket = null

   if (room && excludedSocket) {
      logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
      excludedSocket.broadcast.to(room).emit(type, data)
   } else if (excludedSocket) {
      logger.info(`Broadcast to all excluding user: ${userId}`)
      excludedSocket.broadcast.emit(type, data)
   } else if (room) {
      logger.info(`Emit to room: ${room}`)
      gIo.to(room).emit(type, data)
   } else {
      logger.info(`Emit to all`)
      gIo.emit(type, data)
   }
}

// Helper functions

// Get the socket of a specific user
async function _getUserSocket(userId) {
   const sockets = await _getAllSockets()
   // console.log(
   //    'All sockets:',
   //    sockets.map(s => ({ id: s.id, userId: s.userId }))
   // )

   const socket = sockets.find(s => s.userId === userId)
   socket
      ? _printSocket(socket)
      : console.log(`No socket found for userId: ${userId}`)
   return socket
}

// Get all active sockets
async function _getAllSockets() {
   return await gIo.fetchSockets()
}

// Print details of all active sockets
async function _printSockets() {
   const sockets = await _getAllSockets()
   console.log(`Sockets: (count: ${sockets.length}):`)
   sockets.forEach(_printSocket)
}

// Print the details of a specific socket
function _printSocket(socket) {
   console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

export const socketService = {
   setupSocketAPI,
   emitTo,
   emitToUser,
   broadcast,
}
