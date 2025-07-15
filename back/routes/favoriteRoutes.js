const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');
const { validateFavorite } = require('../middlewares/validation');

// Routes protégées par authentification
router.use(protect);

// Ajouter un livre aux favoris
router.post('/', validateFavorite, favoriteController.addFavorite);

// Retirer un livre des favoris
router.delete('/:bookId', favoriteController.removeFavorite);

// Obtenir les favoris de l'utilisateur connecté
router.get('/me', favoriteController.getUserFavorites);

// Obtenir les favoris d'un utilisateur spécifique
router.get('/user/:userId', favoriteController.getUserFavorites);

// Vérifier si un livre est dans les favoris
router.get('/check/:bookId', favoriteController.checkFavorite);

module.exports = router; 