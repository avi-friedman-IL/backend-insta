import dotenv from 'dotenv'
dotenv.config()
import { Server } from 'socket.io'

import { msgService } from '../api/msg/msg.service.js'
import { userService } from '../api/user/user.service.js'
import { logger } from './logger.service.js'

var gIo = null

export function setupSocketAPI(http) {
   gIo = new Server(http, {
      cors: {
         origin: '*',
      },
   })
   gIo.on('connection', socket => {
      logger.info('Client connected')
      socket.on('disconnect', () => {
         logger.info('Client disconnected')
      })

      socket.on('set-user-socket', userId => {
         socket.userId = userId
      })
      socket.on('unset-user-socket', () => {
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

      socket.on('user-update', user => {
         gIo.emit('user-update', user)
         userService.update(user)
         logger.info(`User ${user._id} updated`)
      })

      socket.on('joinGroup', groupId => {
         socket.join(`group:${groupId}`)
         socket.toGroupId = groupId
         logger.info(`Socket ${socket.id} joined group:${groupId}`)
         _printSockets()
      })

      // socket.on('login', userId => {
      //    socket.userId = userId
      //    gIo.emit('login', userId)
      //    logger.info(`Socket ${socket.id} logged in with userId: ${userId}`)
      // })

      socket.on('msg-add', async msg => {
         gIo.emit('msg-add', msg)
         msgService.add(msg)
         logger.info(`Emitting msg to all users`)
      })

      socket.on('msg-update', async msg => {
         gIo.emit('msg-update', msg)
         msgService.update(msg)
         logger.info(`Emitting msg-update to all users`)
      })

      socket.on('on-respected-msg', async ({ userName, amount }) => {
         gIo.emit('on-respected-msg', { userName, amount })
         logger.info(`Emitting on-respected-msg to all users`)
      })
   })
}

// Emit an event to all users or users watching a specific label
function emitTo({ type, data, label }) {
   if (label) gIo.to('watching:' + label.toString()).emit(type, data)
   else gIo.emit(type, data)
}

// Emit an event to a specific user
async function emitToUser(type, data, userId) {
   userId = userId.toString()
  const socket = await _getUserSocket(userId)
  if (socket) {
     socket.emit(type, data)
     logger.info(`Emitted to user ${userId}`)
  } else {
     logger.info(`No socket found for user ${userId}`)
  }
}


// Broadcast an event to a room or all users, excluding a specific user if needed
async function broadcast({ type, data, room = null, userId }) {
   userId = userId.toString()

   logger.info(`Broadcasting event: ${type}`)
   const excludedSocket = await _getUserSocket(userId)
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
   const socket = sockets.find(socket => socket.userId === userId)
   return socket
}

async function _getAllSockets() {
   const sockets = await gIo.fetchSockets()
   return sockets
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
