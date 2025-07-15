const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');

// Vérifier une session
router.get('/verify/:token', sessionController.verifySession);

// Routes protégées par authentification
router.use(protect);

// Créer une nouvelle session
router.post('/', sessionController.createSession);

// Terminer une session
router.delete('/:token', sessionController.endSession);

// Terminer toutes les sessions sauf la courante
router.delete('/all/except-current', sessionController.endAllSessions);

// Obtenir toutes les sessions actives
router.get('/me', sessionController.getUserSessions);

// Routes admin
router.use(adminMiddleware);

// Nettoyer les sessions expirées
router.delete('/cleanup/expired', sessionController.cleanExpiredSessions);

module.exports = router; 