const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { protect } = require('../middlewares/authMiddleware');
const { validateReadingStatus } = require('../middlewares/validation');

// Routes protégées par authentification
router.use(protect);

// Mettre à jour le statut de lecture d'un livre
router.post('/:bookId', validateReadingStatus, readingController.updateReadingStatus);

// Obtenir l'historique de lecture de l'utilisateur connecté
router.get('/me', readingController.getUserReadingHistory);

// Obtenir l'historique de lecture d'un utilisateur spécifique
router.get('/user/:userId', readingController.getUserReadingHistory);

// Obtenir les statistiques de lecture
router.get('/stats/me', readingController.getReadingStats);
router.get('/stats/user/:userId', readingController.getReadingStats);

// Obtenir le statut de lecture d'un livre spécifique
router.get('/book/:bookId', readingController.getBookReadingStatus);

module.exports = router; 