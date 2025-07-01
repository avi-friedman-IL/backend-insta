import { logger } from '../../services/logger.service.js'
import { objectionService } from './objection.service.js'

export async function getObjections(req, res) {
    const filterBy = req.query
    try {
        const objections = await objectionService.query(filterBy)
        res.send(objections)
    } catch (err) {
        logger.error('Failed to get objections', err)
        res.status(500).send({ err: 'Failed to get objections' })
    }
}

export async function getObjection(req, res) {
    try {
        const objection = await objectionService.getById(req.params.id)
        res.send(objection)
    } catch (err) {
        logger.error('Failed to get objection', err)
        res.status(500).send({ err: 'Failed to get objection' })
    }
}

export async function deleteObjection(req, res) {
    try {
        await objectionService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete objection', err)
        res.status(500).send({ err: 'Failed to delete objection' })
    }
}

export async function updateObjection(req, res) {
    try {
        const objection = req.body
        const savedObjection = await objectionService.update(objection)
        res.send(savedObjection)
    } catch (err) {
        logger.error('Failed to update objection', err)
        res.status(500).send({ err: 'Failed to update objection' })
    }
}

export async function addObjection(req, res) {
    try {
        const objection = req.body
        const savedObjection = await objectionService.add(objection)
        res.json(savedObjection)
    } catch (err) {
        logger.error('Failed to add objection', err)
        res.status(500).send({ err: 'Failed to add objection' })
    }
}

