import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { genderConfig } from '../config/gender.config.js'
import { logger } from './logger.service.js'

export const dbService = {
   getCollection,
   getGenderCollection,
   createGenderCollectionsIfNotExist,
   collectionExists
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
      
      // בדיקה אם הקולקציה קיימת, אם לא - יצירתה
      const exists = await collectionExists(genderCollectionName)
      if (!exists) {
         logger.info(`Gender collection ${genderCollectionName} does not exist, creating it...`)
         await createGenderCollectionsIfNotExist(gender)
      }
      
      const collection = await db.collection(genderCollectionName)
      return collection
   } catch (err) {
      logger.error('Failed to get Mongo gender collection', err)
      throw err
   }
}

async function collectionExists(collectionName) {
   try {
      const db = await _connect()
      const collections = await db.listCollections({ name: collectionName }).toArray()
      return collections.length > 0
   } catch (err) {
      logger.error('Failed to check if collection exists', err)
      throw err
   }
}

async function createGenderCollectionsIfNotExist(gender) {
   try {
      const db = await _connect()
      const collectionsToCreate = genderConfig.getGenderCollections()
      
      logger.info(`Creating gender collections for gender: ${gender}`)
      
      for (const baseCollectionName of collectionsToCreate) {
         const genderCollectionName = genderConfig.getCollectionName(baseCollectionName, gender)
         
         // בדיקה אם הקולקציה כבר קיימת
         const exists = await collectionExists(genderCollectionName)
         
         if (!exists) {
            // יצירת הקולקציה החדשה (ריקה)
            await db.createCollection(genderCollectionName)
            logger.info(`Created new empty collection: ${genderCollectionName}`)
         } else {
            logger.debug(`Collection ${genderCollectionName} already exists`)
         }
      }
      
      logger.info(`Gender collections setup completed for gender: ${gender}`)
   } catch (err) {
      logger.error('Failed to create gender collections', err)
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
