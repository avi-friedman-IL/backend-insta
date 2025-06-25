import { logger } from "../../services/logger.service.js"
import { trainingService } from "./training.service.js"

export async function getTraining(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const training = await trainingService.getById(req.params.id, gender)
        res.send(training)
    } catch (err) {
        logger.error('Failed to get training', err)
        res.status(500).send({ err: 'Failed to get training' })
    }
}

export async function getTrainings(req, res) {
    const filterBy = req.query
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const trainings = await trainingService.query(filterBy, gender)
        res.send(trainings)
    } catch (err) {
        logger.error('Failed to get trainings', err)
        res.status(500).send({ err: 'Failed to get trainings' })
    }
}

export async function deleteTraining(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        await trainingService.remove(req.params.id, gender)
        res.send({ training: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete training', err)
        res.status(500).send({ err: 'Failed to delete training' })
    }
}

export async function updateTraining(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const training = req.body
        const savedTraining = await trainingService.update(training, gender)
        res.send(savedTraining)
    } catch (err) {
        logger.error('Failed to update training', err)
        res.status(500).send({ err: 'Failed to update training' })
    }
}

export async function addTraining(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const training = req.body
        const savedTraining = await trainingService.add(training, gender)
        res.json(savedTraining)
    } catch (err) {
        logger.error('Failed to add training', err)
        res.status(500).send({ err: 'Failed to add training' })
    }
}




