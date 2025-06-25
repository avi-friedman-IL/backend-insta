import { logger } from '../../services/logger.service.js'
import { scriptService } from './script.service.js'

export async function getScripts(req, res) {
    const filterBy = req.query
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const scripts = await scriptService.query(filterBy, gender)
        res.send(scripts)
    } catch (err) {
        logger.error('Failed to get scripts', err)
        res.status(500).send({ err: 'Failed to get scripts' })
    }
}

export async function getScript(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const script = await scriptService.getById(req.params.id, gender)
        res.send(script)
    } catch (err) {
        logger.error('Failed to get script', err)
        res.status(500).send({ err: 'Failed to get script' })
    }
}

export async function deleteScript(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        await scriptService.remove(req.params.id, gender)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete script', err)
        res.status(500).send({ err: 'Failed to delete script' })
    }
}

export async function updateScript(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const script = req.body
        const savedScript = await scriptService.update(script, gender)
        res.send(savedScript)
    } catch (err) {
        logger.error('Failed to update script', err)
        res.status(500).send({ err: 'Failed to update script' })
    }
}

export async function addScript(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const script = req.body
        const savedScript = await scriptService.add(script, gender)
        res.json(savedScript)
    } catch (err) {
        logger.error('Failed to add script', err)
        res.status(500).send({ err: 'Failed to add script' })
    }
}

