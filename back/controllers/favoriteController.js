const { Favorite, Book, User } = require('../models');

// Ajouter un livre aux favoris
exports.addFavorite = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const favorite = await Favorite.create({
            user_id: userId,
            book_id: bookId
        });

        res.status(201).json({
            success: true,
            message: "Livre ajouté aux favoris",
            data: favorite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout aux favoris",
            error: error.message
        });
    }
};

// Retirer un livre des favoris
exports.removeFavorite = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const deleted = await Favorite.destroy({
            where: {
                user_id: userId,
                book_id: bookId
            }
        });

        if (deleted) {
            res.json({
                success: true,
                message: "Livre retiré des favoris"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Favori non trouvé"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du retrait des favoris",
            error: error.message
        });
    }
};

// Obtenir les favoris d'un utilisateur
exports.getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{
                model: Book,
                attributes: ['id', 'title', 'author', 'cover_url']
            }]
        });

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des favoris",
            error: error.message
        });
    }
};

// Vérifier si un livre est dans les favoris
exports.checkFavorite = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const favorite = await Favorite.findOne({
            where: {
                user_id: userId,
                book_id: bookId
            }
        });

        res.json({
            success: true,
            isFavorite: !!favorite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification des favoris",
            error: error.message
        });
    }
}; 