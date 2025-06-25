export default {
    dbURL: 'mongodb://127.0.0.1:27017',
    dbName: 'instaDB',
    
    // הגדרות מגדר לפתח
    gender: {
        default: 'male',
        supported: ['male', 'female'],
        collections: ['script', 'template', 'objection', 'training', 'msg', 'chat']
    },
    
    // הגדרות נוספות לפתח
    features: {
        genderSeparation: true,
        multiGenderSupport: true,
        debugMode: true
    },
    
    // הגדרות לוגים
    logging: {
        level: 'debug',
        genderOperations: true
    }
}
