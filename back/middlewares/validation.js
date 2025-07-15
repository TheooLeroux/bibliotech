// middlewares/validation.js
const { body, param, query, validationResult } = require('express-validator');
const { isDevelopment } = require('./devSecurity');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (isDevelopment) {
            console.log('⚠️ [DEV] Erreurs de validation:', errors.array());
        }
        return res.status(400).json({
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

// Validation pour l'inscription (sécurité maintenue)
const validateRegister = [
    body('pseudo')
        .isLength({ min: 3, max: 50 })
        .withMessage('Pseudo must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Pseudo can only contain letters, numbers, underscore and dash'),
    body('email')
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])/)
        .withMessage('Password must contain at least one lowercase, one uppercase, one number and one special character (@$!%*?&.)'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    handleValidationErrors
];

// Validation pour la connexion
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Validation pour mot de passe oublié
const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    handleValidationErrors
];

// Validation pour reset password (sécurité maintenue)
const validateResetPassword = [
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one lowercase, one uppercase, one number and one special character (@$!%*?&)'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    handleValidationErrors
];

// Validation pour réactivation (sécurité maintenue)
const validateReactivate = [
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one lowercase, one uppercase, one number and one special character (@$!%*?&)'),
    handleValidationErrors
];

// Validation pour créer un livre
const validateCreateBook = [
    body('title')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .trim(),
    body('author')
        .isLength({ min: 1, max: 255 })
        .withMessage('Author must be between 1 and 255 characters')
        .trim(),
    body('description')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Description must be less than 2000 characters')
        .trim(),
    body('language')
        .isLength({ min: 2, max: 10 })
        .withMessage('Language must be between 2 and 10 characters'),
    body('main_genre_id')
        .isInt({ min: 1 })
        .withMessage('Main genre ID must be a positive integer'),
    handleValidationErrors
];

// Validation pour modifier un livre
const validateUpdateBook = validateCreateBook;

// Validation pour les IDs
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    handleValidationErrors
];

// Validation pour la pagination (limite plus élevée en dev pour les tests)
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: isDevelopment ? 1000 : 100 })
        .withMessage(`Limit must be between 1 and ${isDevelopment ? 1000 : 100}`),
    handleValidationErrors
];

// Validation pour les commentaires
const validateComment = [
    body('bookId')
        .isInt({ min: 1 })
        .withMessage('bookId must be a positive integer'),
    body('content')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters')
        .trim()
        .escape(),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('is_spoiler')
        .optional()
        .isBoolean()
        .withMessage('is_spoiler must be boolean'),
    handleValidationErrors
];

// Validation pour les signalements
const validateReport = [
    body('reason')
        .isIn(['inappropriate', 'copyright', 'spam', 'other'])
        .withMessage('Invalid reason'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters')
        .trim()
        .escape(),
    body('bookId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('bookId must be a positive integer'),
    body('commentId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('commentId must be a positive integer'),
    handleValidationErrors
];

// Validation pour le statut de lecture
const validateReadingStatus = [
    body('status')
        .isIn(['to_read', 'reading', 'completed', 'abandoned'])
        .withMessage('Invalid status'),
    body('progress_percentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),
    body('last_page_read')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Last page must be a positive number'),
    handleValidationErrors
];

// Validation pour les favoris
const validateFavorite = [
    body('bookId')
        .isInt({ min: 1 })
        .withMessage('bookId must be a positive integer'),
    handleValidationErrors
];

// Log des validations en développement
if (isDevelopment) {
    console.log('🔧 Validations configurées pour le développement (sécurité maintenue)');
}

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateReactivate,
    validateCreateBook,
    validateUpdateBook,
    validateId,
    validatePagination,
    validateComment,
    validateReport,
    validateReadingStatus,
    validateFavorite
}; 