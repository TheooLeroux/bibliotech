const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');



// Routes protégées par authentification
router.use(protect);

// Obtenir ses notifications
router.get('/', notificationController.getUserNotifications);

// Marquer une notification comme lue
router.patch('/:notificationId/read', notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/read-all', notificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Obtenir le nombre de notifications non lues
router.get('/unread-count', notificationController.getUnreadCount);

// Routes admin
router.use(adminMiddleware);

// Créer une notification (admin seulement)
router.post('/', notificationValidation, notificationController.createNotification);

module.exports = router; 