const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');

// Routes protégées par authentification
router.use(protect);

// Obtenir ses sessions actives
router.get('/', sessionController.getUserSessions);

// Terminer une session spécifique
router.delete('/:sessionId', sessionController.endSession);

// Terminer toutes les autres sessions
router.delete('/revoke-others', sessionController.endAllSessions);

// Routes admin
router.use(adminMiddleware);

// Nettoyer les sessions expirées
router.delete('/cleanup', sessionController.cleanExpiredSessions);

module.exports = router; 