const { Comment, User, Book } = require('../models');

// Ajouter un commentaire
exports.addComment = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { content, rating, is_spoiler } = req.body;
        const userId = req.user.id;

        const comment = await Comment.create({
            user_id: userId,
            book_id: bookId,
            content,
            rating,
            is_spoiler: is_spoiler || false
        });

        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'pseudo', 'avatar_url']
            }]
        });

        res.status(201).json({
            success: true,
            message: "Commentaire ajouté avec succès",
            data: commentWithUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout du commentaire",
            error: error.message
        });
    }
};

// Modifier un commentaire
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, rating, is_spoiler } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: {
                id: commentId,
                user_id: userId
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé ou non autorisé"
            });
        }

        await comment.update({
            content,
            rating,
            is_spoiler,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: "Commentaire mis à jour",
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du commentaire",
            error: error.message
        });
    }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: {
                id: commentId,
                user_id: userId
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé ou non autorisé"
            });
        }

        await comment.destroy();

        res.json({
            success: true,
            message: "Commentaire supprimé"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression du commentaire",
            error: error.message
        });
    }
};

// Obtenir les commentaires d'un livre
exports.getBookComments = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const comments = await Comment.findAndCountAll({
            where: { book_id: bookId },
            include: [{
                model: User,
                attributes: ['id', 'pseudo', 'avatar_url']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(comments.count / limit);

        res.json({
            success: true,
            data: {
                comments: comments.rows,
                pagination: {
                    total: comments.count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des commentaires",
            error: error.message
        });
    }
};

// Modérer un commentaire (admin seulement)
exports.moderateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { is_moderated } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Action non autorisée"
            });
        }

        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé"
            });
        }

        await comment.update({ is_moderated });

        res.json({
            success: true,
            message: "Commentaire modéré avec succès",
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la modération du commentaire",
            error: error.message
        });
    }
}; 