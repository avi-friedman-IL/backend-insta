import { config } from './index.js'

export const genderConfig = {
    // הגדרות בסיסיות
    default: config.gender?.default || 'male',
    supported: config.gender?.supported || ['male', 'female'],
    collections: config.gender?.collections || ['script', 'template', 'objection', 'training', 'msg', 'chat'],
    
    // פונקציות עזר
    isValidGender: (gender) => {
        return config.gender?.supported?.includes(gender) || false
    },
    
    getDefaultGender: () => {
        return config.gender?.default || 'male'
    },
    
    getSupportedGenders: () => {
        return config.gender?.supported || ['male', 'female']
    },
    
    getGenderCollections: () => {
        return config.gender?.collections || ['script', 'template', 'objection', 'training', 'msg', 'chat']
    },
    
    // פונקציה ליצירת שם קולקציה לפי מגדר
    getCollectionName: (baseCollectionName, gender) => {
        const validGender = genderConfig.isValidGender(gender) ? gender : genderConfig.getDefaultGender()
        return `${baseCollectionName}_${validGender}`
    },
    
    // פונקציה לבדיקה אם קולקציה תומכת במגדר
    isGenderSupportedCollection: (collectionName) => {
        return config.gender?.collections?.includes(collectionName) || false
    },
    
    // הגדרות תרגום
    translations: {
        male: {
            he: 'גבר',
            en: 'Male'
        },
        female: {
            he: 'אישה',
            en: 'Female'
        }
    },
    
    // פונקציה לקבלת תרגום
    getTranslation: (gender, language = 'he') => {
        return genderConfig.translations[gender]?.[language] || gender
    }
}

export default genderConfig 