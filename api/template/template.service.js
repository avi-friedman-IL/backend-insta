import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export const templateService = {
   query,
   getById,
   add,
   remove,
   update,
}

async function query(filterBy = {}) {
   const { criteria, sortOptions } = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('template')
      var templates = await collection
         .find(criteria)
         .sort(sortOptions)
         .toArray()
      return templates
   } catch (err) {
      logger.error('cannot find templates', err)
      throw err
   }
}

async function getById(templateId) {
   try {
      const collection = await dbService.getCollection('template')
      const template = await collection.findOne({
         _id: ObjectId.createFromHexString(templateId),
      })
      return template
   } catch (err) {
      logger.error(`while finding template ${templateId}`, err)
      throw err
   }
}

async function add(template) {
   try {
      const collection = await dbService.getCollection('template')
      await collection.insertOne(template)
      return template
   } catch (err) {
      logger.error('cannot insert template', err)
      throw err
   }
}

async function remove(templateId) {
   try {
      const collection = await dbService.getCollection('template')
      await collection.deleteOne({ _id: ObjectId.createFromHexString(templateId) })
      socketService.broadcast({ type: 'template-remove', data: templateId })
   } catch (err) {
      logger.error(`cannot remove template ${templateId}`, err)
      throw err
   }
}

async function update(template) {
   try {
      const templateToSave = { ...template }
      delete templateToSave._id
      const collection = await dbService.getCollection('template')
      await collection.updateOne(
         { _id: ObjectId.createFromHexString(template._id) },
         { $set: templateToSave }
      )
      socketService.broadcast({
         type: 'template-update',
         data: template,
      })
      return template
   } catch (err) {
      logger.error('cannot update template', err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   let sortOptions = { createdAt: -1 } // default sort
   if (filterBy.userId) {
      if (!filterBy.isAdmin || filterBy.isAdmin === 'false' && !filterBy.isTeamManager || filterBy.isTeamManager === 'false') {
         criteria.from = filterBy.userId
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
