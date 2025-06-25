import { config } from './index.js'
import { genderConfig } from './gender.config.js'

export const migrationConfig = {
    // הגדרות מיגרציה
    enabled: true,
    dryRun: false, // אם true, לא יבצע שינויים בפועל
    
    // קולקציות שצריכות מיגרציה
    collectionsToMigrate: genderConfig.getGenderCollections(),
    
    // הגדרות ברירת מחדל למיגרציה
    defaultGender: genderConfig.getDefaultGender(),
    
    // פונקציות מיגרציה
    migrationStrategies: {
        // אסטרטגיה 1: העתקה פשוטה לכל המגדרים
        copyToAllGenders: {
            name: 'copyToAllGenders',
            description: 'מעתיק את כל הדאטה הקיים לכל המגדרים הנתמכים',
            enabled: true
        },
        
        // אסטרטגיה 2: העתקה למגדר ברירת מחדל בלבד
        copyToDefaultGender: {
            name: 'copyToDefaultGender',
            description: 'מעתיק את הדאטה למגדר ברירת מחדל בלבד',
            enabled: false
        },
        
        // אסטרטגיה 3: מיגרציה חכמה לפי שדות
        smartMigration: {
            name: 'smartMigration',
            description: 'מיגרציה חכמה לפי שדות ספציפיים',
            enabled: false,
            fields: ['gender', 'userGender', 'targetGender']
        }
    },
    
    // הגדרות גיבוי
    backup: {
        enabled: true,
        prefix: 'backup_before_migration_',
        collections: ['script', 'template', 'objection', 'training', 'msg', 'chat']
    },
    
    // הגדרות לוגים
    logging: {
        enabled: true,
        level: 'info',
        file: 'migration.log'
    },
    
    // פונקציות עזר
    getMigrationStrategy: (strategyName) => {
        return migrationConfig.migrationStrategies[strategyName]
    },
    
    isStrategyEnabled: (strategyName) => {
        const strategy = migrationConfig.getMigrationStrategy(strategyName)
        return strategy?.enabled || false
    },
    
    getCollectionsToMigrate: () => {
        return migrationConfig.collectionsToMigrate
    },
    
    shouldBackup: () => {
        return migrationConfig.backup.enabled
    },
    
    getBackupPrefix: () => {
        return migrationConfig.backup.prefix
    }
}

export default migrationConfig 