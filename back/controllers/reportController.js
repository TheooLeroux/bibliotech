const { Report, User, Book, Comment, sequelize } = require('../models');

// Créer un signalement
exports.createReport = async (req, res) => {
    try {
        const { bookId, commentId, reason, description } = req.body;
        const reporterId = req.user.id;

        // Vérifier que l'utilisateur ne signale pas son propre contenu
        if (bookId) {
            const book = await Book.findByPk(bookId);
            if (book && book.user_id === reporterId) {
                return res.status(400).json({
                    success: false,
                    message: "Vous ne pouvez pas signaler votre propre livre"
                });
            }
        }

        if (commentId) {
            const comment = await Comment.findByPk(commentId);
            if (comment && comment.user_id === reporterId) {
                return res.status(400).json({
                    success: false,
                    message: "Vous ne pouvez pas signaler votre propre commentaire"
                });
            }
        }

        const report = await Report.create({
            reporter_id: reporterId,
            book_id: bookId,
            comment_id: commentId,
            reason,
            description
        });

        res.status(201).json({
            success: true,
            message: "Signalement créé avec succès",
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création du signalement",
            error: error.message
        });
    }
};

// Obtenir tous les signalements (admin seulement)
exports.getAllReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Action non autorisée"
            });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) {
            where.status = status;
        }

        const reports = await Report.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'pseudo']
                },
                {
                    model: Book,
                    attributes: ['id', 'title']
                },
                {
                    model: Comment,
                    attributes: ['id', 'content']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(reports.count / limit);

        res.json({
            success: true,
            data: {
                reports: reports.rows,
                pagination: {
                    total: reports.count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des signalements",
            error: error.message
        });
    }
};

// Traiter un signalement (admin seulement)
exports.handleReport = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Action non autorisée"
            });
        }

        const { reportId } = req.params;
        const { status, adminComment } = req.body;

        const report = await Report.findByPk(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Signalement non trouvé"
            });
        }

        await report.update({
            status,
            resolved_at: status !== 'pending' ? new Date() : null
        });

        res.json({
            success: true,
            message: "Signalement traité avec succès",
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du traitement du signalement",
            error: error.message
        });
    }
};

// Obtenir les statistiques des signalements (admin seulement)
exports.getReportStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Action non autorisée"
            });
        }

        const stats = await Report.findAll({
            attributes: [
                'status',
                'reason',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status', 'reason']
        });

        const pendingCount = await Report.count({
            where: { status: 'pending' }
        });

        res.json({
            success: true,
            data: {
                stats,
                pendingCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des statistiques",
            error: error.message
        });
    }
}; 