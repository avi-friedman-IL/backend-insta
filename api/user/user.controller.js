import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getUser(req, res) {
   try {
      const user = await userService.getById(req.params.id)
      res.send(user)
   } catch (err) {
      logger.error('Failed to get user', err)
      res.status(500).send({ err: 'Failed to get user' })
   }
}

export async function getUsers(req, res) {
   const filterBy = req.query
   try {
      const users = await userService.query(filterBy)
      res.send(users)
   } catch (err) {
      logger.error('Failed to get users', err)
      res.status(500).send({ err: 'Failed to get users' })
   }
}

export async function deleteUser(req, res) {
   try {
      await userService.remove(req.params.id)
      res.send({ msg: 'Deleted successfully' })
   } catch (err) {
      logger.error('Failed to delete user', err)
      res.status(500).send({ err: 'Failed to delete user' })
   }
}

export async function updateUser(req, res) {
   const { loggedinUser } = req
   try {
      const user = req.body
      const savedUser = await userService.update(user)
      socketService.broadcast({ type: 'user-updated', data: savedUser, userId: loggedinUser._id })
      res.send(savedUser)
   } catch (err) {
      logger.error('Failed to update user', err)
      res.status(500).send({ err: 'Failed to update user' })
   }
}

export async function addUser(req, res) {
   try {
      const user = req.body
      const savedUser = await userService.add(user)
      res.json(savedUser)
   } catch (err) {
      logger.error('Failed to add user', err)
      res.status(500).send({ err: 'Failed to add user' })
   }
}



export async function updateTyping(req, res) {
   try {
      const typing = req.body
      const savedTyping = await userService.updateTyping(typing)
      res.send(savedTyping)
   } catch (err) {
      logger.error('Failed to update typing', err)
      res.status(500).send({ err: 'Failed to update typing' })
   }
}