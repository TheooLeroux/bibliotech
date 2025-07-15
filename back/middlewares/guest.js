// Bloque l'accès si l'utilisateur est déjà connecté
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            // Si le token est valide, l'utilisateur est déjà connecté
            return res.status(403).json({ message: 'Déjà connecté : accès interdit.' });
        } catch (err) {
            // Token invalide ou expiré, on laisse passer
        }
    }
    
    next();
};
