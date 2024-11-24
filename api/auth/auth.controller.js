import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await authService.login(email, password, false)
        const loginToken = authService.getLoginToken(user)
        
        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken)

        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function googleLogin(req, res) {
    const { token } = req.body
    try {
       const user = await authService.googleLogin(token)
       const userToSave = await authService.login(user.email, user.password, true)
       const loginToken = authService.getLoginToken(userToSave)
 
       logger.info('User login: ', userToSave)
       res.cookie('loginToken', loginToken)
       res.json(userToSave)
    } catch (err) {
       logger.error('Failed to Login ' + err)
       res.status(401).send({ err: 'Failed to Login' })
    }
 }

export async function signup(req, res) {
    try {
        const { email, password, fullname } = req.body
        const account = await authService.signup(email, password, fullname)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        
        const user = await authService.login(email, password, false)
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken)
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res){
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}