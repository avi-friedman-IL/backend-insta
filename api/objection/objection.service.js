export const objectionService = {
   query,
   getById,
   remove,
   update,
   add,
}

import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

async function query(filterBy = {}) {
   const criteria = _buildCriteria(filterBy)
   const collection = await dbService.getCollection('objection')
   try {
      const objections = await collection.find(criteria).toArray()
      return objections
   } catch (err) {
      console.log('ERROR: cannot find objections')
      throw err
   }
}

async function getById(objectionId) {
   const collection = await dbService.getCollection('objection')
   try {
      const objection = await collection.findOne({
         _id: ObjectId.createFromHexString(objectionId),
      })
      return objection
   } catch (err) {
      console.log(`ERROR: while finding objection ${objectionId}`)
      throw err
   }
}

async function remove(objectionId) {
   const collection = await dbService.getCollection('objection')
   try {
      await collection.deleteOne({ _id: ObjectId(objectionId) })
   } catch (err) {
      console.log(`ERROR: cannot remove objection ${objectionId}`)
      throw err
   }
}

async function update(objection) {
   try {
        const objectionToSave = {...objection, _id: ObjectId.createFromHexString(objection._id)}
        const collection = await dbService.getCollection('objection')
        // objection._id = ObjectId.createFromHexString(objection._id)
        await collection.updateOne({ _id: objectionToSave._id }, { $set: objectionToSave })
        return objectionToSave
   } catch (err) {
      console.log(`ERROR: cannot update objection ${objection._id}`)
      throw err
   }
}

async function add(objection) {
   const collection = await dbService.getCollection('objection')
   try {
      await collection.insertOne(objection)
      return objection
   } catch (err) {
      console.log(`ERROR: cannot insert objection`)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   return criteria
}
