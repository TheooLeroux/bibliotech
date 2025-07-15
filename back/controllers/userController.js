const { User } = require('../models');

// GET /users — admin only
exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password', 'reset_token'] }, // Exclure les champs sensibles
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Users retrieved successfully.',
            data: {
                users: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// GET /users/:id — owner OR admin
exports.getOne = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);
        if (req.user.id !== targetId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        
        const user = await User.findByPk(targetId, {
            attributes: { exclude: ['password', 'reset_token'] } // Exclure les champs sensibles
        });
        
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        res.status(200).json({
            message: 'User retrieved successfully.',
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// PUT /users/:id — owner OR admin
exports.update = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);
        if (req.user.id !== targetId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        
        const user = await User.findByPk(targetId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const updates = { ...req.body };
        
        // Correction : utiliser avatar_url au lieu de avatar
        if (req.file) {
            updates.avatar_url = req.file.path;
        }

        // Empêcher la modification de champs sensibles
        delete updates.password;
        delete updates.reset_token;
        delete updates.reset_token_expires;
        delete updates.role; // Seul un admin peut changer le rôle

        await user.update(updates);
        
        // Retourner l'utilisateur sans champs sensibles
        const updatedUser = await User.findByPk(targetId, {
            attributes: { exclude: ['password', 'reset_token'] }
        });
        
        console.log(`✏️ Profil mis à jour: ${updatedUser.pseudo} (ID: ${targetId}) par User ${req.user.id}`);
        res.status(200).json({
            message: 'User updated successfully.',
            user: updatedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// DELETE /users/:id — admin only OU owner (suppression volontaire)
exports.remove = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);
        
        // Vérifier les permissions : admin OU propriétaire du compte
        if (req.user.role !== 'admin' && req.user.id !== targetId) {
            console.log(`🚫 Tentative de suppression non autorisée: User ${req.user.id} a essayé de supprimer User ${targetId}`);
            return res.status(403).json({ message: 'Forbidden.' });
        }
        
        const user = await User.findByPk(targetId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        // Empêcher la suppression de l'utilisateur Anonyme (ID 1)
        if (user.id === 1) {
            return res.status(400).json({ message: 'Cannot delete the Anonymous user.' });
        }
        
        const { Book } = require('../models');
        
        // Transférer tous les livres de cet utilisateur vers l'utilisateur Anonyme (ID 1)
        const booksTransferred = await Book.update(
            { user_id: 1 }, // Transférer vers l'utilisateur Anonyme
            { where: { user_id: user.id } }
        );
        
        // Supprimer définitivement l'utilisateur (RGPD - droit à l'oubli)
        await user.destroy();
        
        console.log(`✅ Utilisateur ${user.pseudo} (ID: ${user.id}) supprimé définitivement`);
        console.log(`📚 ${booksTransferred[0]} livre(s) transféré(s) vers l'utilisateur Anonyme`);
        
        res.status(200).json({
            message: 'User deleted successfully.',
            booksTransferred: booksTransferred[0]
        });
    } catch (err) {
        console.error('Erreur lors de la suppression utilisateur:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
