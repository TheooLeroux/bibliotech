// tests/setup.js
require('dotenv').config({ path: '.env.test' });

// Configuration globale pour les tests
global.testConfig = {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:4000',
    timeout: 10000,
    testUser: {
        pseudo: 'TestUser',
        email: 'test@example.com',
        password: 'TestPassword123!'
    },
    testAdmin: {
        pseudo: 'TestAdmin',
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        role: 'admin'
    }
};

// Mock console pour réduire le bruit pendant les tests
const originalConsole = global.console;
global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error // Garder les erreurs pour debug
};

// Restaurer console après chaque test
afterEach(() => {
    jest.clearAllMocks();
});

// Nettoyage global après tous les tests
afterAll(async () => {
    // Fermer les connexions DB si nécessaire
    const { sequelize } = require('../models');
    if (sequelize) {
        await sequelize.close();
    }
}); 