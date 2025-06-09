import { logger } from "../../services/logger.service.js"
import { trainingService } from "./training.service.js"

export async function getTraining(req, res) {
    try {
        const training = await trainingService.getById(req.params.id)
        res.send(training)
    } catch (err) {
        logger.error('Failed to get training', err)
        res.status(500).send({ err: 'Failed to get training' })
    }
}

export async function getTrainings(req, res) {
    const filterBy = req.query
    try {
        const trainings = await trainingService.query(filterBy)
        res.send(trainings)
    } catch (err) {
        logger.error('Failed to get trainings', err)
        res.status(500).send({ err: 'Failed to get trainings' })
    }
}

export async function deleteTraining(req, res) {
    try {
        await trainingService.remove(req.params.id)
        res.send({ training: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete training', err)
        res.status(500).send({ err: 'Failed to delete training' })
    }
}

export async function updateTraining(req, res) {
    try {
        const training = req.body
        const savedTraining = await trainingService.update(training)
        res.send(savedTraining)
    } catch (err) {
        logger.error('Failed to update training', err)
        res.status(500).send({ err: 'Failed to update training' })
    }
}

export async function addTraining(req, res) {
    try {
        const training = req.body
        const savedTraining = await trainingService.add(training)
        res.json(savedTraining)
    } catch (err) {
        logger.error('Failed to add training', err)
        res.status(500).send({ err: 'Failed to add training' })
    }
}




