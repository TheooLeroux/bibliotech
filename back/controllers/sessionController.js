const { UserSession, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Créer une nouvelle session
exports.createSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('User-Agent');

        // Créer un token unique
        const token = uuidv4();

        // Définir la date d'expiration (par exemple, 30 jours)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const session = await UserSession.create({
            user_id: userId,
            token,
            ip_address,
            user_agent,
            expires_at: expiresAt
        });

        res.status(201).json({
            success: true,
            message: "Session créée avec succès",
            data: {
                token: session.token,
                expires_at: session.expires_at
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la session",
            error: error.message
        });
    }
};

// Vérifier une session
exports.verifySession = async (req, res) => {
    try {
        const { token } = req.params;

        const session = await UserSession.findOne({
            where: {
                token,
                expires_at: {
                    [Op.gt]: new Date()
                }
            },
            include: [{
                model: User,
                attributes: ['id', 'pseudo', 'role', 'is_active']
            }]
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session invalide ou expirée"
            });
        }

        if (!session.User.is_active) {
            return res.status(403).json({
                success: false,
                message: "Compte utilisateur inactif"
            });
        }

        // Mettre à jour la dernière activité
        await session.update({
            last_activity: new Date()
        });

        res.json({
            success: true,
            data: {
                user: session.User,
                session: {
                    expires_at: session.expires_at,
                    last_activity: session.last_activity
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification de la session",
            error: error.message
        });
    }
};

// Terminer une session
exports.endSession = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const deleted = await UserSession.destroy({
            where: {
                token,
                user_id: userId
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Session non trouvée"
            });
        }

        res.json({
            success: true,
            message: "Session terminée avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la fermeture de la session",
            error: error.message
        });
    }
};

// Terminer toutes les sessions d'un utilisateur (sauf la session courante)
exports.endAllSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentToken = req.headers.authorization?.split(' ')[1];

        await UserSession.destroy({
            where: {
                user_id: userId,
                token: {
                    [Op.ne]: currentToken
                }
            }
        });

        res.json({
            success: true,
            message: "Toutes les autres sessions ont été terminées"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la fermeture des sessions",
            error: error.message
        });
    }
};

// Obtenir toutes les sessions actives d'un utilisateur
exports.getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await UserSession.findAll({
            where: {
                user_id: userId,
                expires_at: {
                    [Op.gt]: new Date()
                }
            },
            attributes: ['id', 'ip_address', 'user_agent', 'created_at', 'last_activity', 'expires_at']
        });

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des sessions",
            error: error.message
        });
    }
};

// Nettoyer les sessions expirées (tâche de maintenance)
exports.cleanExpiredSessions = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Action non autorisée"
            });
        }

        const deleted = await UserSession.destroy({
            where: {
                expires_at: {
                    [Op.lt]: new Date()
                }
            }
        });

        res.json({
            success: true,
            message: `${deleted} sessions expirées ont été nettoyées`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du nettoyage des sessions",
            error: error.message
        });
    }
}; 