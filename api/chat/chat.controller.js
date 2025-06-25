import { logger } from "../../services/logger.service.js"
import { chatService } from "./chat.service.js"

export async function getChat(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const chat = await chatService.getById(req.params.id, gender)
        res.send(chat)
    } catch (err) {
        logger.error('Failed to get chat', err)
        res.status(500).send({ err: 'Failed to get chat' })
    }
}

export async function getChats(req, res) {
    const filterBy = req.query
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const chats = await chatService.query(filterBy, gender)
        res.send(chats)
    } catch (err) {
        logger.error('Failed to get chats', err)
        res.status(500).send({ err: 'Failed to get chats' })
    }
}

export async function deleteChat(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        await chatService.remove(req.params.id, gender)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete chat', err)
        res.status(500).send({ err: 'Failed to delete chat' })
    }
}

export async function updateChat(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const chat = req.body
        const savedChat = await chatService.update(chat, gender)
        res.send(savedChat)
    } catch (err) {
        logger.error('Failed to update chat', err)
        res.status(500).send({ err: 'Failed to update chat' })
    }
}

export async function addChat(req, res) {
    const gender = req.query.gender || req.user?.gender || 'male'
    try {
        const chat = req.body
        const savedChat = await chatService.add(chat, gender)
        res.json(savedChat)
    } catch (err) {
        logger.error('Failed to add chat', err)
        res.status(500).send({ err: 'Failed to add chat' })
    }
}




