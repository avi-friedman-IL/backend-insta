import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export const trainingService = {
   query,
   getById,
   add,
   remove,
   update,
}

async function query(filterBy = {}) {
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('training')
      var trainings = await collection
         .find(criteria)
         .sort({ createdAt: -1 })
         .toArray()
      return trainings
   } catch (err) {
      logger.error('cannot find trainings', err)
      throw err
   }
}

async function getById(trainingId) {
   try {
      const collection = await dbService.getCollection('training')
      const training = await collection.findOne({
         _id: ObjectId.createFromHexString(trainingId),
      })
      return training
   } catch (err) {
      logger.error(`while finding training ${trainingId}`, err)
      throw err
   }
}

async function add(training) {
   try {
      const collection = await dbService.getCollection('training')
      await collection.insertOne(training)
      return training
   } catch (err) {
      logger.error('cannot insert training', err)
      throw err
   }
}

async function remove(trainingId) {
   try {
      const collection = await dbService.getCollection('training')
      await collection.deleteOne({ _id: ObjectId.createFromHexString(trainingId) })
      socketService.broadcast({ type: 'training-remove', data: trainingId })
   } catch (err) {
      logger.error(`cannot remove training ${trainingId}`, err)
      throw err
   }
}

async function update(training) {
   try {
      const trainingToSave = { ...training }
      delete trainingToSave._id
      const collection = await dbService.getCollection('training')
      await collection.updateOne(
         { _id: ObjectId.createFromHexString(training._id) },
         { $set: trainingToSave }
      )
      socketService.broadcast({
         type: 'training-update',
         data: training,
      })
      return training
   } catch (err) {
      logger.error('cannot update training', err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   if (filterBy.gender) criteria.gender = filterBy.gender
   return criteria
}
