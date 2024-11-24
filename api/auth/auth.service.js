import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

dotenv.config()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const cryptr = new Cryptr(process.env.SECRET1)

export const authService = {
   signup,
   login,
   googleLogin,
   getLoginToken,
   validateToken,
}

async function login(email, password, isGoogleLogin) {
   logger.debug(`auth.service - login with email: ${email}`)

   const user = await userService.getByEmail(email)
   if (!user) throw new Error('Invalid email or password')

   const match = await bcrypt.compare(password, user.password)
   if (!match && !isGoogleLogin) throw new Error('Invalid email or password')

   delete user.password
   return user
}

async function googleLogin(token) {
   const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
   })
   const payload = ticket.getPayload()

   let user = await userService.getByEmail(payload.email)
   if (user) user._id = user._id.toString()

   const { sub, email, name, picture, hashing } = payload
   if (!user) {
      const newUser = {
         password: sub,
         fullname: name,
         imgUrl: picture,
         isAdmin: true,
         email: email,
         isGoogleLogin: true,
      }
      await userService.add(newUser)
      return newUser
   }
   return user
}

async function signup(email, password, fullname) {
   const saltRounds = 10

   logger.debug(
      `auth.service - signup with email: ${email}, fullname: ${fullname}`
   )
   if (!email || !password || !fullname) throw new Error('Missing details')

   const hash = await bcrypt.hash(password, saltRounds)
   return userService.add({ email, password: hash, fullname })
}

function getLoginToken(user) {
   const userInfo = {
      _id: user._id,
      fullname: user.fullname,
      isAdmin: user.isAdmin,
   }
   return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
   try {
      const json = cryptr.decrypt(loginToken)
      const loggedinUser = JSON.parse(json)
      return loggedinUser
   } catch (err) {
      console.log('Invalid login token')
   }
   return null
}
