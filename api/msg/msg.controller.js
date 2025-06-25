import { logger } from "../../services/logger.service.js"
import { msgService } from "./msg.service.js"

export async function getMsg(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const msg = await msgService.getById(req.params.id, gender)
        res.send(msg)
    } catch (err) {
        logger.error('Failed to get msg', err)
        res.status(500).send({ err: 'Failed to get msg' })
    }
}

export async function getMsgs(req, res) {
    const filterBy = req.query
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const msgs = await msgService.query(filterBy, gender)
        res.send(msgs)
    } catch (err) {
        logger.error('Failed to get msgs', err)
        res.status(500).send({ err: 'Failed to get msgs' })
    }
}

export async function deleteMsg(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        await msgService.remove(req.params.id, gender)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete msg', err)
        res.status(500).send({ err: 'Failed to delete msg' })
    }
}

export async function updateMsg(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const msg = req.body
        const savedMsg = await msgService.update(msg, gender)
        res.send(savedMsg)
    } catch (err) {
        logger.error('Failed to update msg', err)
        res.status(500).send({ err: 'Failed to update msg' })
    }
}

export async function addMsg(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const msg = req.body
        const savedMsg = await msgService.add(msg, gender)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add msg', err)
        res.status(500).send({ err: 'Failed to add msg' })
    }
}




