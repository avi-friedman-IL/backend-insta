import { MongoClient } from 'mongodb'
import { config } from '../config/index.js'
import { logger } from '../services/logger.service.js'

class UpdateUsersGender {
    constructor() {
        this.db = null
        this.client = null
    }

    async connect() {
        try {
            console.log('Connecting to MongoDB...')
            console.log('DB URL:', config.dbURL)
            console.log('DB Name:', config.dbName)
            
            this.client = await MongoClient.connect(config.dbURL)
            this.db = this.client.db(config.dbName)
            console.log('Successfully connected to MongoDB')
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err)
            throw err
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close()
            console.log('Disconnected from MongoDB')
        }
    }

    async updateUsersGender() {
        try {
            console.log('Starting user gender update...')
            const userCollection = this.db.collection('user')
            
            // בדיקה כמה משתמשים יש במסד הנתונים
            const totalUsers = await userCollection.countDocuments()
            console.log(`Total users in database: ${totalUsers}`)
            
            // מצא את כל המשתמשים שאין להם שדה gender או שיש להם gender שונה מ-'male'
            const usersToUpdate = await userCollection.find({
                $or: [
                    { gender: { $exists: false } },
                    { gender: { $ne: 'male' } }
                ]
            }).toArray()

            console.log(`Users that need gender update: ${usersToUpdate.length}`)
            
            if (usersToUpdate.length === 0) {
                console.log('No users need gender update - all users already have gender: male')
                return
            }

            // הצג את המשתמשים שצריכים עדכון
            usersToUpdate.forEach(user => {
                console.log(`- ${user.fullname || user.username}: current gender = ${user.gender || 'undefined'}`)
            })

            // עדכן את כל המשתמשים
            const updateResult = await userCollection.updateMany(
                {
                    $or: [
                        { gender: { $exists: false } },
                        { gender: { $ne: 'male' } }
                    ]
                },
                {
                    $set: {
                        gender: 'male',
                        updatedAt: new Date()
                    }
                }
            )

            console.log(`Successfully updated ${updateResult.modifiedCount} users with gender: male`)

            // בדיקה - הצג את כל המשתמשים עם המגדר שלהם
            const allUsers = await userCollection.find({}).toArray()
            console.log('Current users with their gender:')
            allUsers.forEach(user => {
                console.log(`- ${user.fullname || user.username}: ${user.gender || 'undefined'}`)
            })

        } catch (err) {
            console.error('Failed to update users gender:', err)
            throw err
        }
    }

    async runUpdate() {
        try {
            await this.connect()
            await this.updateUsersGender()
            console.log('User gender update completed successfully')
        } catch (err) {
            console.error('User gender update failed:', err)
            throw err
        } finally {
            await this.disconnect()
        }
    }
}

// הרצת הסקריפט אם הוא רץ ישירות
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Starting user gender update script...')
    const updater = new UpdateUsersGender()
    updater.runUpdate()
        .then(() => {
            console.log('User gender update script completed successfully')
            process.exit(0)
        })
        .catch((err) => {
            console.error('User gender update script failed:', err)
            process.exit(1)
        })
}

export default UpdateUsersGender 