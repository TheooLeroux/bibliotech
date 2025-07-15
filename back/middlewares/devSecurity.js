// middlewares/devSecurity.js
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

// Middleware pour logger les requêtes sensibles en développement
const devSecurityLogger = (req, res, next) => {
    if (isDevelopment) {
        const sensitiveRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'];
        const currentRoute = req.originalUrl;
        
        if (sensitiveRoutes.some(route => currentRoute.includes(route))) {
            console.log(`🔐 [DEV] Requête sensible: ${req.method} ${currentRoute} - IP: ${req.ip}`);
        }
    }
    next();
};

// Middleware pour désactiver certaines sécurités en développement
const relaxedSecurity = (req, res, next) => {
    if (isDevelopment) {
        // Ajouter des headers de développement
        res.setHeader('X-Dev-Mode', 'true');
        
        // Log des tokens pour debug (JAMAIS EN PRODUCTION)
        if (req.headers.authorization) {
            console.log(`🔑 [DEV] Token reçu: ${req.headers.authorization.substring(0, 20)}...`);
        }
    }
    next();
};

// Middleware pour nettoyer automatiquement les tokens expirés en dev
const autoCleanup = async (req, res, next) => {
    if (isDevelopment) {
        try {
            const { BlacklistedToken } = require('../models');
            
            // Nettoyer les tokens expirés toutes les heures
            const lastCleanup = global.lastTokenCleanup || 0;
            const now = Date.now();
            
            if (now - lastCleanup > 3600000) { // 1 heure
                const deleted = await BlacklistedToken.destroy({
                    where: {
                        expires_at: {
                            [require('sequelize').Op.lt]: new Date()
                        }
                    }
                });
                
                if (deleted > 0) {
                    console.log(`🧹 [DEV] Nettoyage automatique: ${deleted} tokens expirés supprimés`);
                }
                
                global.lastTokenCleanup = now;
            }
        } catch (error) {
            console.error('❌ [DEV] Erreur lors du nettoyage des tokens:', error.message);
        }
    }
    next();
};

// Middleware pour afficher les erreurs détaillées en développement
const detailedErrors = (err, req, res, next) => {
    if (isDevelopment) {
        console.error('🚨 [DEV] Erreur détaillée:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(err.status || 500).json({
            success: false,
            message: err.message,
            stack: err.stack,
            details: {
                url: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // En production, erreur générique
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};

module.exports = {
    devSecurityLogger,
    relaxedSecurity,
    autoCleanup,
    detailedErrors,
    isDevelopment
}; 