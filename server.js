import dotenv from 'dotenv'
dotenv.config()
import express  from 'express'
import cookieParser from 'cookie-parser'
import cors  from 'cors'
import http from 'http'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { setupSocketAPI } from './services/socket.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()

const server = http.createServer(app)
setupSocketAPI(server)


// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))



if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173', 
            'http://localhost:5173',

            'http://127.0.0.1:3000', 
            'http://localhost:3000',
            'http://127.0.0.1:3030', 
            'http://localhost:3030',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { scriptRoutes } from './api/script/script.routes.js'
import { objectionRoutes } from './api/objection/objection.routes.js'
import { chatRoutes } from './api/chat/chat.routes.js'
import { msgRoutes } from './api/msg/msg.routes.js'

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/script', scriptRoutes)
app.use('/api/objection', objectionRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/msg', msgRoutes)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})