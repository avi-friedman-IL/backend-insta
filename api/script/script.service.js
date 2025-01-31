export const scriptService = {
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
   const collection = await dbService.getCollection('script')
   try {
      const scripts = await collection.find(criteria).toArray()
      return scripts
   } catch (err) {
      console.log('ERROR: cannot find scripts')
      throw err
   }
}

async function getById(scriptId) {
   const collection = await dbService.getCollection('script')
   try {
      const script = await collection.findOne({
         _id: ObjectId.createFromHexString(scriptId),
      })
      return script
   } catch (err) {
      console.log(`ERROR: while finding script ${scriptId}`)
      throw err
   }
}

async function remove(scriptId) {
   const collection = await dbService.getCollection('script')
   try {
      await collection.deleteOne({ _id: ObjectId(scriptId) })
   } catch (err) {
      console.log(`ERROR: cannot remove script ${scriptId}`)
      throw err
   }
}

async function update(script) {
   try {
        const scriptToSave = {...script, _id: ObjectId.createFromHexString(script._id)}
        const collection = await dbService.getCollection('script')
        // script._id = ObjectId.createFromHexString(script._id)
        await collection.updateOne({ _id: scriptToSave._id }, { $set: scriptToSave })
        return scriptToSave
   } catch (err) {
      console.log(`ERROR: cannot update script ${script._id}`)
      throw err
   }
}

async function add(script) {
   const collection = await dbService.getCollection('script')
   try {
      await collection.insertOne(script)
      return script
   } catch (err) {
      console.log(`ERROR: cannot insert script`)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   return criteria
}
