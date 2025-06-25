export default {
    dbURL: 'mongodb+srv://avi551650:1234@cluster2.tk06j.mongodb.net/',
    dbName: 'instaDB',
    
    // הגדרות מגדר לייצור
    gender: {
        default: 'male',
        supported: ['male', 'female'],
        collections: ['script', 'template', 'objection', 'training', 'msg', 'chat']
    },
    
    // הגדרות נוספות לייצור
    features: {
        genderSeparation: true,
        multiGenderSupport: true,
        debugMode: false
    },
    
    // הגדרות לוגים
    logging: {
        level: 'error',
        genderOperations: false
    }
}
