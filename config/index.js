import configProd from './prod.js'
import configDev from './dev.js'

export var config

if (process.env.NODE_ENV === 'production') {
    config = configProd
} else {
    config = configDev
}

// הגדרות כלליות
config.isGuestMode = true

// הגדרות מגדר
config.gender = {
    default: 'male',
    supported: ['male', 'female'],
    collections: ['script', 'template', 'objection', 'training', 'msg', 'chat']
}

// הגדרות נוספות
config.features = {
    genderSeparation: true,
    multiGenderSupport: true
}
