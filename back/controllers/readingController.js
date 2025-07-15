const { ReadingHistory, Book, User, sequelize } = require('../models');

// Mettre à jour le statut de lecture
exports.updateReadingStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { status, progress_percentage, last_page_read } = req.body;
        const userId = req.user.id;

        const [reading, created] = await ReadingHistory.findOrCreate({
            where: { user_id: userId, book_id: bookId },
            defaults: {
                status,
                progress_percentage: progress_percentage || 0,
                last_page_read: last_page_read || 0
            }
        });

        if (!created) {
            await reading.update({
                status,
                progress_percentage: progress_percentage || reading.progress_percentage,
                last_page_read: last_page_read || reading.last_page_read,
                completed_at: status === 'completed' ? new Date() : reading.completed_at
            });
        }

        res.json({
            success: true,
            message: "Statut de lecture mis à jour",
            data: reading
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du statut de lecture",
            error: error.message
        });
    }
};

// Obtenir l'historique de lecture d'un utilisateur
exports.getUserReadingHistory = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const { status } = req.query;

        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }

        const history = await ReadingHistory.findAll({
            where,
            include: [{
                model: Book,
                attributes: ['id', 'title', 'author', 'cover_url']
            }],
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'historique de lecture",
            error: error.message
        });
    }
};

// Obtenir les statistiques de lecture
exports.getReadingStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const stats = await ReadingHistory.findAll({
            where: { user_id: userId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const totalBooks = await ReadingHistory.count({
            where: { user_id: userId }
        });

        const completedBooks = await ReadingHistory.count({
            where: { 
                user_id: userId,
                status: 'completed'
            }
        });

        res.json({
            success: true,
            data: {
                statusBreakdown: stats,
                totalBooks,
                completedBooks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des statistiques de lecture",
            error: error.message
        });
    }
};

// Obtenir le statut de lecture d'un livre
exports.getBookReadingStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const reading = await ReadingHistory.findOne({
            where: {
                user_id: userId,
                book_id: bookId
            }
        });

        res.json({
            success: true,
            data: reading || { status: null, progress_percentage: 0, last_page_read: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du statut de lecture",
            error: error.message
        });
    }
}; 