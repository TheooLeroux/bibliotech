const express = require('express');
const router  = express.Router();
const { protect }    = require('../middlewares/authMiddleware');
const admin          = require('../middlewares/admin');
const upload         = require('../middlewares/upload');
const userController = require('../controllers/userController');
const { validateId, validatePagination } = require('../middlewares/validation');
const { generalLimiter } = require('../middlewares/rateLimiter');

router.get('/', generalLimiter, protect, admin, validatePagination, userController.getAll);
router.get('/:id', generalLimiter, protect, validateId, userController.getOne);
router.put('/:id', generalLimiter, protect, validateId, upload.single('avatar'), userController.update);
router.delete('/:id', generalLimiter, protect, validateId, userController.remove);

module.exports = router;
