import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const chatService = {
   query,
   getById,
   add,
   remove,
   update,
}
async function query(filterBy) {
   if (!filterBy.userId) return []
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('chat')
      const chats = await collection.find(criteria).sort({ 'msgs.createdAt': -1 }).toArray()
      return chats
   } catch (err) {
      console.error('Cannot find chats', err)
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
       return chat
    } catch (err) {
       logger.error('cannot update chat', err)
       throw err
    }
 }
 
 function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.userId) {
      const {userId} = filterBy
        criteria.$or = [
            { toId: userId },
            { ownerId: userId },
            { 'groupUsers._id': userId }
        ]
    }
    return criteria
 }
