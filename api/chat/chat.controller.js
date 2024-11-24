import { logger } from "../../services/logger.service.js"
import { chatService } from "./chat.service.js"

export async function getChat(req, res) {
    try {
        const chat = await chatService.getById(req.params.id)
        res.send(chat)
    } catch (err) {
        logger.error('Failed to get chat', err)
        res.status(500).send({ err: 'Failed to get chat' })
    }
}

export async function getChats(req, res) {
    const filterBy = req.query
    try {
        const chats = await chatService.query(filterBy)
        res.send(chats)
    } catch (err) {
        logger.error('Failed to get chats', err)
        res.status(500).send({ err: 'Failed to get chats' })
    }
}

export async function deleteChat(req, res) {
    try {
        await chatService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete chat', err)
        res.status(500).send({ err: 'Failed to delete chat' })
    }
}

export async function updateChat(req, res) {
    try {
        const chat = req.body
        const savedChat = await chatService.update(chat)
        res.send(savedChat)
    } catch (err) {
        logger.error('Failed to update chat', err)
        res.status(500).send({ err: 'Failed to update chat' })
    }
}

export async function addChat(req, res) {
    try {
        const chat = req.body
        const savedChat = await chatService.add(chat)
        res.json(savedChat)
    } catch (err) {
        logger.error('Failed to add chat', err)
        res.status(500).send({ err: 'Failed to add chat' })
    }
}




