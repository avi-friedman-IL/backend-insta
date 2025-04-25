import { logger } from "../../services/logger.service.js"
import { templateService } from "./template.service.js"

export async function getTemplate(req, res) {
    try {
        const template = await templateService.getById(req.params.id)
        res.send(template)
    } catch (err) {
        logger.error('Failed to get template', err)
        res.status(500).send({ err: 'Failed to get template' })
    }
}

export async function getTemplates(req, res) {
    const filterBy = req.query
    try {
        const templates = await templateService.query(filterBy)
        res.send(templates)
    } catch (err) {
        logger.error('Failed to get templates', err)
        res.status(500).send({ err: 'Failed to get templates' })
    }
}

export async function deleteTemplate(req, res) {
    try {
        await templateService.remove(req.params.id)
        res.send({ template: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete template', err)
        res.status(500).send({ err: 'Failed to delete template' })
    }
}

export async function updateTemplate(req, res) {
    try {
        const template = req.body
        const savedTemplate = await templateService.update(template)
        res.send(savedTemplate)
    } catch (err) {
        logger.error('Failed to update template', err)
        res.status(500).send({ err: 'Failed to update template' })
    }
}

export async function addTemplate(req, res) {
    try {
        const template = req.body
        const savedTemplate = await templateService.add(template)
        res.json(savedTemplate)
    } catch (err) {
        logger.error('Failed to add template', err)
        res.status(500).send({ err: 'Failed to add template' })
    }
}




