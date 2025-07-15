// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Détection de l'environnement
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

// Fonction pour skip localhost en développement
const skipLocalhost = isDevelopment ? (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
} : undefined;

// Rate limiting général
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite normale maintenue
    message: {
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipLocalhost // Skip localhost en dev uniquement
});

// Rate limiting pour l'authentification (sécurité maintenue)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite stricte maintenue
    message: {
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: skipLocalhost // Skip localhost en dev uniquement
});

// Rate limiting pour l'upload de fichiers (sécurité maintenue)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // Limite stricte maintenue
    message: {
        message: 'Too many file uploads, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipLocalhost // Skip localhost en dev uniquement
});

// Rate limiting pour les mots de passe oubliés (sécurité maintenue)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // Limite stricte maintenue
    message: {
        message: 'Too many password reset requests, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipLocalhost // Skip localhost en dev uniquement
});

// Log des rate limits en développement
if (isDevelopment) {
    console.log('🔧 Rate limiting configuré pour le développement (skip localhost uniquement)');
}

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    passwordResetLimiter
}; 