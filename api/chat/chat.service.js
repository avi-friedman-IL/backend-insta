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

async function query(filterBy = {}, gender = 'male') {
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getGenderCollection('chat', gender)
      var chats = await collection.find(criteria).toArray()
      return chats
   } catch (err) {
      logger.error('cannot find chats', err)
      throw err
   }
}

async function getById(chatId, gender = 'male') {
   try {
      const collection = await dbService.getGenderCollection('chat', gender)
      const chat = await collection.findOne({
         _id: ObjectId.createFromHexString(chatId),
      })
      return chat
   } catch (err) {
      logger.error(`while finding chat ${chatId}`, err)
      throw err
   }
}

async function add(chat, gender = 'male') {
   try {
      const collection = await dbService.getGenderCollection('chat', gender)
      await collection.insertOne(chat)
      return chat
   } catch (err) {
      logger.error('cannot insert chat', err)
      throw err
   }
}

async function remove(chatId, gender = 'male') {
   try {
      const collection = await dbService.getGenderCollection('chat', gender)
      await collection.deleteOne({ _id: ObjectId.createFromHexString(chatId) })
      socketService.broadcast({ type: 'chat-remove', data: chatId })
   } catch (err) {
      logger.error(`cannot remove chat ${chatId}`, err)
      throw err
   }
}

async function update(chat, gender = 'male') {
   try {
      const chatToSave = { ...chat }
      delete chatToSave._id
      const collection = await dbService.getGenderCollection('chat', gender)
      await collection.updateOne(
         { _id: ObjectId.createFromHexString(chat._id) },
         { $set: chatToSave }
      )
      socketService.broadcast({
         type: 'chat-update',
         data: chat,
      })
      return chat
   } catch (err) {
      logger.error('cannot update chat', err)
      throw err
   }
}

async function aggregation(toUserId, gender = 'male') {
   const collection = await dbService.getGenderCollection('chat', gender)
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
   const { toUserId, fromUserId, toGroupId } = filterBy
   if (toUserId) {
      return {
         $or: [
            { toUserId, fromUserId },
            { toUserId: fromUserId, fromUserId: toUserId },
         ],
      }
   }
   if (toGroupId) {
      return { toGroupId }
   }
   const criteria = {}
   return criteria
}
