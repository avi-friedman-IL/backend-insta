import { config } from './index.js'
import { genderConfig } from './gender.config.js'

export const permissionsConfig = {
    // הגדרות הרשאות בסיסיות
    defaultPermissions: {
        read: true,
        write: true,
        delete: false,
        admin: false
    },
    
    // הרשאות לפי מגדר
    genderPermissions: {
        male: {
            // הרשאות למגדר גברי
            script: { read: true, write: true, delete: true, admin: true },
            template: { read: true, write: true, delete: true, admin: true },
            objection: { read: true, write: true, delete: true, admin: true },
            training: { read: true, write: true, delete: true, admin: true },
            msg: { read: true, write: true, delete: true, admin: true },
            chat: { read: true, write: true, delete: true, admin: true }
        },
        female: {
            // הרשאות למגדר נשי
            script: { read: true, write: true, delete: true, admin: true },
            template: { read: true, write: true, delete: true, admin: true },
            objection: { read: true, write: true, delete: true, admin: true },
            training: { read: true, write: true, delete: true, admin: true },
            msg: { read: true, write: true, delete: true, admin: true },
            chat: { read: true, write: true, delete: true, admin: true }
        }
    },
    
    // הרשאות מיוחדות למנהלים
    adminPermissions: {
        crossGenderAccess: true, // גישה לדאטה של מגדרים אחרים
        genderManagement: true, // ניהול הגדרות מגדר
        migrationAccess: true, // גישה למיגרציה
        backupAccess: true // גישה לגיבויים
    },
    
    // פונקציות עזר
    hasPermission: (userGender, collectionName, action) => {
        const permissions = permissionsConfig.genderPermissions[userGender]?.[collectionName]
        if (!permissions) {
            return permissionsConfig.defaultPermissions[action] || false
        }
        return permissions[action] || false
    },
    
    canRead: (userGender, collectionName) => {
        return permissionsConfig.hasPermission(userGender, collectionName, 'read')
    },
    
    canWrite: (userGender, collectionName) => {
        return permissionsConfig.hasPermission(userGender, collectionName, 'write')
    },
    
    canDelete: (userGender, collectionName) => {
        return permissionsConfig.hasPermission(userGender, collectionName, 'delete')
    },
    
    canAdmin: (userGender, collectionName) => {
        return permissionsConfig.hasPermission(userGender, collectionName, 'admin')
    },
    
    // בדיקה אם משתמש יכול לגשת לדאטה של מגדר אחר
    canAccessOtherGender: (userGender, targetGender, isAdmin = false) => {
        if (isAdmin && permissionsConfig.adminPermissions.crossGenderAccess) {
            return true
        }
        return userGender === targetGender
    },
    
    // קבלת הרשאות למשתמש
    getUserPermissions: (userGender, isAdmin = false) => {
        const permissions = {
            gender: userGender,
            isAdmin: isAdmin,
            collections: {}
        }
        
        const collections = genderConfig.getGenderCollections()
        collections.forEach(collectionName => {
            permissions.collections[collectionName] = {
                read: permissionsConfig.canRead(userGender, collectionName),
                write: permissionsConfig.canWrite(userGender, collectionName),
                delete: permissionsConfig.canDelete(userGender, collectionName),
                admin: permissionsConfig.canAdmin(userGender, collectionName)
            }
        })
        
        // הוספת הרשאות מנהל
        if (isAdmin) {
            permissions.admin = permissionsConfig.adminPermissions
        }
        
        return permissions
    },
    
    // בדיקת הרשאות לפני פעולה
    validatePermission: (userGender, collectionName, action, isAdmin = false) => {
        // מנהלים תמיד יכולים הכל
        if (isAdmin) {
            return true
        }
        
        // בדיקת הרשאה רגילה
        return permissionsConfig.hasPermission(userGender, collectionName, action)
    },
    
    // קבלת רשימת קולקציות מורשות
    getAuthorizedCollections: (userGender, action = 'read') => {
        const collections = genderConfig.getGenderCollections()
        return collections.filter(collectionName => 
            permissionsConfig.hasPermission(userGender, collectionName, action)
        )
    }
}

export default permissionsConfig 