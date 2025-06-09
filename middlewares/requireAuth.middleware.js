import { logger } from '../services/logger.service.js'
import { authService } from '../api/auth/auth.service.js'

export async function requireAuth(req, res, next) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }
    
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated')

    req.loggedinUser = loggedinUser
    next()
}

export async function requireAdmin(req, res, next) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser.isAdmin) {
        logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}

export async function requireTeamManager(req, res, next) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }
    
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser.isTeamManager && !loggedinUser.isAdmin) {
        logger.warn(loggedinUser.fullname + 'attempted to perform team manager action')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}

export async function requireOwner(req, res, next) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (loggedinUser._id !== req.params.id) {
        logger.warn(loggedinUser.fullname + 'attempted to perform action on another user')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}