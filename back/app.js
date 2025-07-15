require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const readingRoutes = require('./routes/readingRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { devSecurityLogger, relaxedSecurity, autoCleanup, detailedErrors, isDevelopment } = require('./middlewares/devSecurity');

const app = express();

// Configuration CORS sécurisée
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware globaux
app.use(generalLimiter); // Rate limiting global
app.use(cors(corsOptions));

// Configuration Helmet adaptée au développement
if (isDevelopment) {
    app.use(helmet({
        contentSecurityPolicy: false, // Désactivé en dev pour faciliter le debug
        crossOriginEmbedderPolicy: false
    }));
    console.log('🔧 Helmet configuré pour le développement (CSP désactivé)');
} else {
    app.use(helmet());
}

app.use(express.json({ limit: '10mb' })); // Limite de 10MB pour les requêtes JSON

// Middlewares de développement
if (isDevelopment) {
    app.use(morgan('dev')); // Log plus simple en dev
    app.use(devSecurityLogger);
    app.use(relaxedSecurity);
    app.use(autoCleanup);
    console.log('🔧 Middlewares de développement activés');
} else {
    app.use(morgan('combined')); // Log plus détaillé pour la production
}

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'BiblioTech API is running...',
        version: '1.0.0',
        environment: isDevelopment ? 'development' : 'production',
        timestamp: new Date().toISOString()
    });
});

// Middleware de gestion d'erreurs global
if (isDevelopment) {
    app.use(detailedErrors);
} else {
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'File too large.' });
        }
        
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({ message: 'Invalid JSON payload.' });
        }
        
        if (err.message && err.message.includes('Invalid eBook file')) {
            return res.status(400).json({ message: err.message });
        }
        
        if (err.message && err.message.includes('Invalid cover image')) {
            return res.status(400).json({ message: err.message });
        }
        
        return res.status(500).json({ message: 'Internal server error.' });
    });
}

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found.',
        environment: isDevelopment ? 'development' : 'production'
    });
});

module.exports = app;
