const jwt = require('jsonwebtoken');
const { User, BlacklistedToken } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;

exports.protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized.' });

    try {
        // Vérifier si le token est blacklisté
        const blacklistedToken = await BlacklistedToken.findOne({ where: { token } });
        if (blacklistedToken) {
            return res.status(401).json({ message: 'Token has been revoked.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Vérifier que l'utilisateur existe toujours et n'est pas anonymisé
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active || user.anonymized_at) {
            return res.status(401).json({ message: 'Account no longer valid.' });
        }
        
        // Empêcher l'utilisateur Anonyme (ID 1) de se connecter
        if (user.id === 1) {
            return res.status(403).json({ message: 'Anonymous user cannot authenticate.' });
        }
        
        req.user = { id: user.id, role: user.role, pseudo: user.pseudo };
        req.token = token; // Stocker le token pour le logout
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

exports.requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        next();
    };
};
