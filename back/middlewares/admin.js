// Vérifie que l’utilisateur est admin via la propriété `role`
module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};
