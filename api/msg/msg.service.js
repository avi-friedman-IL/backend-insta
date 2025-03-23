import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export const msgService = {
   query,
   getById,
   add,
   remove,
   update,
}

async function query(filterBy = {}) {
   const { criteria, sortOptions } = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('msg')
      var msgs = await collection
         .find(criteria)
         .sort(sortOptions)
         .toArray()
      return msgs
   } catch (err) {
      logger.error('cannot find msgs', err)
      throw err
   }
}

async function getById(msgId) {
   try {
      const collection = await dbService.getCollection('msg')
      const msg = await collection.findOne({
         _id: ObjectId.createFromHexString(msgId),
      })
      return msg
   } catch (err) {
      logger.error(`while finding msg ${msgId}`, err)
      throw err
   }
}

async function add(msg) {
   try {
      const collection = await dbService.getCollection('msg')
      await collection.insertOne(msg)
      return msg
   } catch (err) {
      logger.error('cannot insert msg', err)
      throw err
   }
}

async function remove(msgId) {
   try {
      const collection = await dbService.getCollection('msg')
      await collection.deleteOne({ _id: ObjectId.createFromHexString(msgId) })
      socketService.broadcast({ type: 'msg-remove', data: msgId })
   } catch (err) {
      logger.error(`cannot remove msg ${msgId}`, err)
      throw err
   }
}

async function update(msg) {
   try {
      const msgToSave = { ...msg }
      delete msgToSave._id
      const collection = await dbService.getCollection('msg')
      await collection.updateOne(
         { _id: ObjectId.createFromHexString(msg._id) },
         { $set: msgToSave }
      )
      socketService.broadcast({
         type: 'msg-update',
         data: msg,
      })
      return msg
   } catch (err) {
      logger.error('cannot update msg', err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   let sortOptions = { createdAt: -1 } // default sort
   if (filterBy.loggedinUserId) {
      if (!filterBy.isAdmin || filterBy.isAdmin === 'false' && !filterBy.isTeamManager || filterBy.isTeamManager === 'false') {
         criteria.from = filterBy.loggedinUserId
      }
   }
   if (filterBy.text) {
      const textPattern = filterBy.text.trim()
      criteria.$or = [
         { fromName: { $regex: textPattern, $options: 'i' } },
         { subject: { $regex: textPattern, $options: 'i' } },
         { content: { $regex: textPattern, $options: 'i' } },
      ]
   }

   if (filterBy.subject) {
      criteria.subject = { $regex: filterBy.subject, $options: 'i' }
   }

   if (filterBy.isDone === 'true') {
      criteria.isDone = true
   } else if (filterBy.isDone === 'false') {
      criteria.isDone = false
   }

   if (filterBy.sortBy) {
      if (filterBy.sortBy === 'date') {
         sortOptions = { createdAt: -1 }
      } else if (filterBy.sortBy === 'name') {
         sortOptions = { fromName: 1 }
      } else if (filterBy.sortBy === 'subject') {
         sortOptions = { subject: 1 }
      }
   }

   console.log('criteria:', criteria)
   console.log('sortOptions:', sortOptions)
   return { criteria, sortOptions }
}
