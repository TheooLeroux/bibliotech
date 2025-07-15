const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');
const { validateComment } = require('../middlewares/validation');

// Routes publiques
router.get('/book/:bookId', commentController.getBookComments);

// Routes protégées par authentification
router.use(protect);

// Ajouter un commentaire
router.post('/book/:bookId', validateComment, commentController.addComment);

// Modifier son propre commentaire
router.put('/:commentId', validateComment, commentController.updateComment);

// Supprimer son propre commentaire
router.delete('/:commentId', commentController.deleteComment);

// Routes admin
router.use(adminMiddleware);

// Modérer un commentaire (admin seulement)
router.patch('/:commentId/moderate', commentController.moderateComment);

module.exports = router; 