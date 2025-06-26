// import dotenv from 'dotenv'
// dotenv.config()
import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.SECRET_KEY) {
   throw new Error('Cryptr: secret must be a non-0-length string')
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const cryptr = new Cryptr(process.env.SECRET_KEY)

export const authService = {
   signup,
   login,
   getLoginToken,
   validateToken,
}

async function login(credentials) {
   logger.debug(`auth.service - login with username: ${credentials.username}`)

   const user = await userService.getByUsername(credentials.username)
   const { password } = credentials
   if (!user) throw new Error('Invalid email or password')

   const match = password === user.password
   if (!match) throw new Error('Invalid email or password')
   // const match = await bcrypt.compare(password, user.password)
   // if (!match) throw new Error('Invalid email or password')

   // delete user.password
   return user
}

async function signup(credentials) {
   const saltRounds = 10

   logger.debug(
      `auth.service - signup with username: ${credentials.username}, fullname: ${credentials.fullname}`
   )
   if (!credentials.username || !credentials.password || !credentials.fullname)
      throw new Error('Missing details')

   // const hash = await bcrypt.hash(credentials.password, saltRounds)
   return userService.add({ ...credentials, password: credentials.password })
}

function getLoginToken(user) {
   const userInfo = {
      _id: user._id,
      fullname: user.fullname,
      isAdmin: user.isAdmin,
      gender: user.gender || 'male'
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
