// routes/bookRoutes.js
const express       = require('express');
const router        = express.Router();
const { protect }   = require('../middlewares/authMiddleware');
const uploadBook    = require('../middlewares/uploadBook');
const bookController = require('../controllers/bookController');
const { validateCreateBook, validateId, validatePagination } = require('../middlewares/validation');
const { generalLimiter, uploadLimiter } = require('../middlewares/rateLimiter');

// GET /api/books - Lister tous les livres (public avec filtres)
router.get('/', generalLimiter, validatePagination, bookController.getBooks);

// GET /api/books/:id - Récupérer un livre par ID (public/privé selon visibilité)
router.get('/:id', generalLimiter, validateId, bookController.getBook);

// POST /api/books - Créer un livre (authentifié)
router.post(
    '/',
    uploadLimiter,
    protect,
    uploadBook,
    validateCreateBook,
    bookController.createBook
);

// PUT /api/books/:id - Modifier un livre (authentifié, propriétaire ou admin)
router.put(
    '/:id',
    uploadLimiter,
    protect,
    validateId,
    uploadBook,
    validateCreateBook,
    bookController.updateBook
);

// DELETE /api/books/:id - Supprimer un livre (authentifié, propriétaire ou admin)
router.delete('/:id', generalLimiter, protect, validateId, bookController.deleteBook);

module.exports = router;
