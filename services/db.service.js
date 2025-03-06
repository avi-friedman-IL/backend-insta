import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = {
   getCollection,
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

async function _connect() {
   if (dbConn) return dbConn
   try {
      // const client = await MongoClient.connect(config.dbURL, { useUnifiedTopology: true })
      const client = await MongoClient.connect(config.dbURL)
      const db = client.db(config.dbName)
      dbConn = db
      // const chatsCollection = db.collection('chat')
      // await chatsCollection.createIndex({ fromUserId: 1 })
      // await chatsCollection.createIndex({ toUserId: 1 })
      // await chatsCollection.createIndex({ toGroupId: 1 })
      // await chatsCollection.createIndex({ fromUserId: 1, toUserId: 1 })
      // console.log('Indexes created successfully for chats collection')
      return db
   } catch (err) {
      logger.error('Cannot Connect to DB', err)
      throw err
   }
}
