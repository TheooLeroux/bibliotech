// Bloque l’accès si l’utilisateur est déjà connecté
module.exports = (req, res, next) => {
    if (req.user) {
        return res.status(403).json({ message: 'Déjà connecté : accès interdit.' });
    }
    next();
};
