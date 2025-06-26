import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { genderConfig } from '../config/gender.config.js'
import { logger } from './logger.service.js'

export const dbService = {
   getCollection,
   getGenderCollection
}

var dbConn = null

async function getCollection(collectionName) {
   try {
      const db = await _connect()
      const collection = await db.collection(collectionName)
      return collection
   } catch (err) {
      logger.error('Failed to get Mongo collection', err)
      throw err
   }
}

async function getGenderCollection(collectionName, gender = 'male') {
   try {
      const db = await _connect()
      
      // בדיקה אם הקולקציה תומכת במגדר
      if (!genderConfig.isGenderSupportedCollection(collectionName)) {
         logger.warn(`Collection ${collectionName} does not support gender separation`)
         return await getCollection(collectionName)
      }
      
      // יצירת שם קולקציה לפי מגדר
      const genderCollectionName = genderConfig.getCollectionName(collectionName, gender)
      
      // לוג לפתח
      if (config.logging?.genderOperations) {
         logger.debug(`Getting gender collection: ${genderCollectionName} for gender: ${gender}`)
      }
      
      const collection = await db.collection(genderCollectionName)
      return collection
   } catch (err) {
      logger.error('Failed to get Mongo gender collection', err)
      throw err
   }
}

async function _connect() {
   if (dbConn) return dbConn
   try {
      const client = await MongoClient.connect(config.dbURL)
      const db = client.db(config.dbName)
      dbConn = db
      return db
   } catch (err) {
      logger.error('Cannot Connect to DB', err)
      throw err
   }
}
