import { logger } from "../../services/logger.service.js"
import { msgService } from "./msg.service.js"
import { socketService } from "../../services/socket.service.js"

export async function getMsg(req, res) {
    try {
        const msg = await msgService.getById(req.params.id)
        res.send(msg)
    } catch (err) {
        logger.error('Failed to get msg', err)
        res.status(500).send({ err: 'Failed to get msg' })
    }
}

export async function getMsgs(req, res) {
    const filterBy = req.query
    try {
        const msgs = await msgService.query(filterBy)
        res.send(msgs)
    } catch (err) {
        logger.error('Failed to get msgs', err)
        res.status(500).send({ err: 'Failed to get msgs' })
    }
}

export async function deleteMsg(req, res) {
    const { loggedinUser } = req
    try {
        await msgService.remove(req.params.id)
        socketService.broadcast({ type: 'msg-removed', data: req.params.id, userId: loggedinUser._id })
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete msg', err)
        res.status(500).send({ err: 'Failed to delete msg' })
    }
}

export async function updateMsg(req, res) {
    const { loggedinUser } = req
    try {
        const msg = req.body
        const savedMsg = await msgService.update(msg)
        socketService.broadcast({ type: 'msg-updated', data: savedMsg, userId: loggedinUser._id })
        res.send(savedMsg)
    } catch (err) {
        logger.error('Failed to update msg', err)
        res.status(500).send({ err: 'Failed to update msg' })
    }
}

export async function addMsg(req, res) {
    const { loggedinUser } = req
    try {
        const msg = req.body
        const savedMsg = await msgService.add(msg)
        socketService.broadcast({ type: 'msg-added', data: savedMsg, userId: loggedinUser._id })
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add msg', err)
        res.status(500).send({ err: 'Failed to add msg' })
    }
}




