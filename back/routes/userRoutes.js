const express = require('express');
const router  = express.Router();
const { protect }    = require('../middlewares/authMiddleware');
const admin          = require('../middlewares/admin');
const upload         = require('../middlewares/upload');
const userController = require('../controllers/userController');

router.get('/',        protect, admin, userController.getAll);
router.get('/:id',     protect, userController.getOne);
router.put('/:id',     protect, upload.single('avatar'), userController.update);
router.delete('/:id',  protect, admin, userController.remove);

module.exports = router;
