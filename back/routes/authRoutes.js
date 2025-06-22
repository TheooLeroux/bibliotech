const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');
const guest = require('../middlewares/guest');
const { protect } = require('../middlewares/authMiddleware');

// guest-only
router.post('/register',         guest, authController.register);
router.post('/login',            guest, authController.login);

// mot de passe oublié / reset
router.post('/forgot-password',  authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// réactivation
router.get('/verify-reactivate/:token', authController.verifyReactivate);
router.post('/reactivate/:token',      authController.reactivate);

// logout
router.post('/logout', protect, authController.logout);

module.exports = router;
