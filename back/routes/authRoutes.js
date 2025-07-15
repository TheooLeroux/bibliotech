const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');
const guest = require('../middlewares/guest');
const { protect } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateReactivate } = require('../middlewares/validation');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

// guest-only avec validation et rate limiting
router.post('/register', authLimiter, guest, validateRegister, authController.register);
router.post('/login', authLimiter, guest, validateLogin, authController.login);

// mot de passe oublié / reset avec rate limiting strict
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, validateResetPassword, authController.resetPassword);

// réactivation
router.get('/verify-reactivate/:token', authController.verifyReactivate);
router.post('/reactivate/:token', passwordResetLimiter, validateReactivate, authController.reactivate);

// logout
router.post('/logout', protect, authController.logout);

module.exports = router;
