import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export const chatService = {
   query,
   getById,
   add,
   remove,
   update,
   aggregation,
}

async function query(filterBy = {}) {
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('chat')
      var chats = await collection.find(criteria).toArray()
      return chats
   } catch (err) {
      logger.error('cannot find chats', err)
      throw err
   }
}

async function getById(chatId) {
   try {
      const collection = await dbService.getCollection('chat')
      const chat = await collection.findOne({
         _id: ObjectId.createFromHexString(chatId),
      })
      return chat
   } catch (err) {
      logger.error(`while finding chat ${chatId}`, err)
      throw err
   }
}

async function add(chat) {
   try {
      const collection = await dbService.getCollection('chat')
      await collection.insertOne(chat)
      socketService.broadcast({
         type: 'chat-add',
         data: chat,
         userId: chat.toUserId,
      })
      // socketService.emitToUser( {
      //    type: 'chat-add',
      //    data: chat,
      //    userId: chat.toUserId,
      // })

      
      return chat
   } catch (err) {
      logger.error('cannot insert chat', err)
      throw err
   }
}

async function remove(chatId) {
   try {
      const collection = await dbService.getCollection('chat')
      await collection.deleteOne({ _id: ObjectId.createFromHexString(chatId) })
   } catch (err) {
      logger.error(`cannot remove chat ${chatId}`, err)
      throw err
   }
}

async function update(chat) {
   try {
      const chatToSave = { ...chat }
      delete chatToSave._id
      const collection = await dbService.getCollection('chat')
      await collection.updateOne(
         { _id: ObjectId.createFromHexString(chat._id) },
         { $set: chatToSave }
      )
      socketService.broadcast({
         type: 'chat-update',
         data: chat,
         userId: chat.toUserId,
      })
      return chat
   } catch (err) {
      logger.error('cannot update chat', err)
      throw err
   }
}

async function aggregation(toUserId) {
   const collection = await dbService.getCollection('chat')
   try {
      const pipeline = [
         {
            $match: {
               toUserId: toUserId,
            },
         },
         {
            $group: {
               _id: '$toUserId',
               fromUserId: { $push: '$fromUserId' },
               msg: { $push: '$msg' },
               createdAt: { $push: '$createdAt' },
            },
         },
      ]
      const aggResult = await collection.aggregate(pipeline).toArray()
      console.log('aggResult:', aggResult)
      return aggResult
   } catch (err) {
      logger.error('aggregation error', err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const { toUserId, fromUserId } = filterBy
   if (toUserId) {
      return {
         $or: [
            { toUserId, fromUserId },
            { toUserId: fromUserId, fromUserId: toUserId },
            // { toUserId: toUserId, fromUserId: toUserId },
            // { toUserId: fromUserId, fromUserId: fromUserId },
         ],
      }
   }
   const criteria = {}
   return criteria
}
