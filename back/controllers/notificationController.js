const { Notification, User } = require('../models');

// Créer une notification
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, content } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        const notification = await Notification.create({
            user_id: userId,
            type,
            content
        });

        res.status(201).json({
            success: true,
            message: "Notification créée",
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la notification",
            error: error.message
        });
    }
};

// Obtenir les notifications d'un utilisateur
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, unreadOnly = false } = req.query;

        const where = { user_id: userId };
        if (unreadOnly === 'true') {
            where.is_read = false;
        }

        const offset = (page - 1) * limit;

        const notifications = await Notification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(notifications.count / limit);

        res.json({
            success: true,
            data: {
                notifications: notifications.rows,
                pagination: {
                    total: notifications.count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des notifications",
            error: error.message
        });
    }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: {
                id: notificationId,
                user_id: userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification non trouvée"
            });
        }

        await notification.update({ is_read: true });

        res.json({
            success: true,
            message: "Notification marquée comme lue",
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la notification",
            error: error.message
        });
    }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { is_read: true },
            { where: { user_id: userId, is_read: false } }
        );

        res.json({
            success: true,
            message: "Toutes les notifications ont été marquées comme lues"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour des notifications",
            error: error.message
        });
    }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const deleted = await Notification.destroy({
            where: {
                id: notificationId,
                user_id: userId
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Notification non trouvée"
            });
        }

        res.json({
            success: true,
            message: "Notification supprimée"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de la notification",
            error: error.message
        });
    }
};

// Obtenir le nombre de notifications non lues
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        res.json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du comptage des notifications non lues",
            error: error.message
        });
    }
}; 