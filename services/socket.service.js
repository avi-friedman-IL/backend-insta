import dotenv from 'dotenv'
dotenv.config()
import { Server } from 'socket.io'
import cloudinary from 'cloudinary'

import { chatService } from '../api/chat/chat.service.js'
import { msgService } from '../api/msg/msg.service.js'
import { userService } from '../api/user/user.service.js'
import { logger } from './logger.service.js'

var gIo = null

cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
})

// פונקציה להעלאת קובץ לענן
async function uploadFileToCloudinary(file) {
   try {
      if (!file || !file.data) return null

      const base64Data = file.data.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const fileName = `${Date.now()}-${file.name.replace(
         /[^A-Za-z0-9.]/g,
         '_'
      )}`

      // בדיקה אם זה קובץ PDF ושינוי הפרמטרים בהתאם
      const isExcel = /\.(xlsx|xls|csv)$/i.test(file.name)
      const isPDF = file.name.toLowerCase().endsWith('.pdf')

      const uploadResult = await new Promise((resolve, reject) => {
         cloudinary.v2.uploader
            .upload_stream(
               {
                  public_id: fileName,
                  resource_type: isExcel ? 'raw' : 'auto',
                  ...(isPDF ? { format: 'pdf', pages: true } : {}),
               },
               (error, result) => {
                  if (error) reject(error)
                  else resolve(result)
               }
            )
            .end(buffer)
      })

      if (!uploadResult || !uploadResult.secure_url) {
         logger.error('Uploaded file URL is not valid')
         return null
      }

      const fileInfo = {
         url: uploadResult.secure_url,
         originalName: file.name,
         // Update to properly handle image mime types
         type:
            uploadResult.resource_type === 'image'
               ? `image/${uploadResult.format}`
               : file.type || 'application/octet-stream',
         format: uploadResult.format || '',
         size: file.size || 0,
      }

      // יצירת URL להורדה וצפייה
      if (isPDF) {
         // לקבצי PDF, משתמשים ב-URL שונים להצגה והורדה
         fileInfo.viewUrl = fileInfo.url
         fileInfo.downloadUrl = `${fileInfo.url.replace(
            '/upload/',
            '/upload/fl_attachment/'
         )}`
      } else {
         // לשאר הקבצים
         fileInfo.viewUrl = fileInfo.url
         fileInfo.downloadUrl = `${fileInfo.url.replace(
            '/upload/',
            '/upload/fl_attachment/'
         )}`
      }

      logger.info(`File uploaded successfully: ${fileInfo.url}`)
      logger.info(`File type: ${fileInfo.type}, format: ${fileInfo.format}`)
      logger.info(`View URL: ${fileInfo.viewUrl}`)
      logger.info(`Download URL: ${fileInfo.downloadUrl}`)

      return fileInfo
   } catch (error) {
      logger.error('Error uploading file to Cloudinary:', error)
      return null
   }
}

export function setupSocketAPI(http) {
   gIo = new Server(http, {
      cors: {
         origin: '*',
      },
      maxHttpBufferSize: 1e8,
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

      socket.on('login', userId => {
         socket.userId = userId
         gIo.emit('login', userId)
         logger.info(`Socket ${socket.id} logged in with userId: ${userId}`)
      })

      socket.on('chat-add', async chat => {
         try {
            // טיפול בקובץ מצורף אם קיים
            if (chat.file && chat.file.data) {
               const fileInfo = await uploadFileToCloudinary(chat.file)
               if (fileInfo) {
                  chat.file = { ...chat.file, ...fileInfo }
               }
            }

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
         } catch (err) {
            logger.error(`Error handling chat-add: ${err}`)
         }
      })

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
