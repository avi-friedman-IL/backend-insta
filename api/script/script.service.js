export const scriptService = {
   query,
   getById,
   remove,
   update,
   add,
}

import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

async function query(filterBy = {}, gender = 'male') {
   const criteria = _buildCriteria(filterBy)
   const collection = await dbService.getGenderCollection('script', gender)
   try {
      const scripts = await collection.find(criteria).toArray()
      return scripts
   } catch (err) {
      console.log('ERROR: cannot find scripts')
      throw err
   }
}

async function getById(scriptId, gender = 'male') {
   const collection = await dbService.getGenderCollection('script', gender)
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

async function remove(scriptId, gender = 'male') {
   const collection = await dbService.getGenderCollection('script', gender)
   try {
      // await collection.deleteOne({ _id: ObjectId(scriptId) })'
      await collection.deleteOne({ _id: ObjectId.createFromHexString(scriptId) })
   } catch (err) {
      console.log(`ERROR: cannot remove script ${scriptId}`)
      throw err
   }
}

async function update(script, gender = 'male') {
   try {
        const scriptToSave = {...script, _id: ObjectId.createFromHexString(script._id)}
        const collection = await dbService.getGenderCollection('script', gender)
        // script._id = ObjectId.createFromHexString(script._id)
        await collection.updateOne({ _id: scriptToSave._id }, { $set: scriptToSave })
        return scriptToSave
   } catch (err) {
      console.log(`ERROR: cannot update script ${script._id}`)
      throw err
   }
}

async function add(script, gender = 'male') {
   const collection = await dbService.getGenderCollection('script', gender)
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
