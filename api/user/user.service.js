import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

export const userService = {
   query,
   getById,
   getByEmail,
   getByUsername,
   remove,
   update,
   add,
}

async function query(filterBy = {}) {
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection('user')
      var users = await collection
         .find(criteria)
         .sort({ username: 1 })
         .toArray()
      users = users.map(user => {
         user.createdAt = user._id.getTimestamp()
         return user
      })
      return users
   } catch (err) {
      logger.error('cannot find users', err)
      throw err
   }
}

async function getById(userId) {
   try {
      const collection = await dbService.getCollection('user')
      const user = await collection.findOne({
         _id: ObjectId.createFromHexString(userId),
      })
      // delete user.password
      return user
   } catch (err) {
      logger.error(`while finding user ${userId}`, err)
      throw err
   }
}
async function getByEmail(email) {
   try {
      const collection = await dbService.getCollection('user')
      const user = await collection.findOne({ email })
      return user
   } catch (err) {
      logger.error(`while finding user ${email}`, err)
      throw err
   }
}

async function getByUsername(username) {
   try {
      const collection = await dbService.getCollection('user')
      const user = await collection.findOne({
         username,
      })
      return user
   } catch (err) {
      logger.error(`while finding user ${username}`, err)
      throw err
   }
}

async function remove(userId) {
   try {
      const collection = await dbService.getCollection('user')
      await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
   } catch (err) {
      logger.error(`cannot remove user ${userId}`, err)
      throw err
   }
}

async function update(user) {
   try {
      const userToSave = {
         _id: ObjectId.createFromHexString(user._id),
         fullname: user.fullname,
         username: user.username,
         password: user.password,
         email: user.email,
         imgUrl: user.imgUrl,
         color: user.color,
         isGoogleLogin: user.isGoogleLogin,
         contacts: user.contacts,
         groups: user.groups,
         newMsgs: user.newMsgs,
         notifications: user.notifications || [],
         isAdmin: user.isAdmin || false,
         isTeamManager: user.isTeamManager || false,
         contacts: user.contacts || [],
      }
      const collection = await dbService.getCollection('user')
      await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
      return userToSave
   } catch (err) {
      logger.error(`cannot update user ${user._id}`, err)
      throw err
   }
}

async function add(user) {
   try {
      const existUser = user.isGoogleLogin
         ? await getByEmail(user.email)
         : await getByUsername(user.username)
      if (existUser) throw new Error('Username taken')

      const userToAdd = {
         email: user.email,
         password: user.password,
         fullname: user.fullname,
         username: user.username,
         imgUrl: user.imgUrl,
         color: user.color,
         isGoogleLogin: user.isGoogleLogin || false,
         isAdmin: false,
         contacts: user.contacts || [],
      }
      const collection = await dbService.getCollection('user')
      await collection.insertOne(userToAdd)
      return userToAdd
   } catch (err) {
      logger.error('cannot insert user', err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   if (filterBy.text) {
      const txtCriteria = { $regex: filterBy.text, $options: 'i' }
      criteria.fullname = txtCriteria
   }
   
   return criteria
}
