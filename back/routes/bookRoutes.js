// routes/bookRoutes.js
const express       = require('express');
const router        = express.Router();
const { protect }   = require('../middlewares/authMiddleware');
const uploadBook    = require('../middlewares/uploadBook');
const bookController = require('../controllers/bookController');

// POST /api/books
router.post(
    '/',
    protect,
    uploadBook,
    bookController.createBook
);

router.put(
    '/:id',
    protect,
    uploadBook,
    bookController.updateBook
);

module.exports = router;
