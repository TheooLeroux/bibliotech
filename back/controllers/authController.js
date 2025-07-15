const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, BlacklistedToken } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// — REGISTER —
exports.register = async (req, res) => {
    const { pseudo, email, password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
        }
        if (await User.findOne({ where: { email } })) {
            return res.status(400).json({ message: 'Email déjà enregistré.' });
        }
        if (await User.findOne({ where: { pseudo } })) {
            return res.status(400).json({ message: 'Pseudo déjà pris.' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ pseudo, email, password: hash });
        
        console.log(`👤 Nouveau compte créé: ${user.pseudo} (${email}) - ID: ${user.id}`);
        return res.status(201).json({
            message: 'Compte créé avec succès.',
            user: { id: user.id, pseudo: user.pseudo }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};

// — LOGIN —
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`🚫 Tentative de connexion échouée: email inexistant ${email}`);
            return res.status(400).json({ message: 'Identifiants invalides.' });
        }
        if (!user.is_active) {
            console.log(`🚫 Tentative de connexion échouée: compte désactivé ${email} (ID: ${user.id})`);
            return res.status(403).json({ message: 'Compte désactivé.' });
        }
        if (user.anonymized_at) {
            console.log(`🚫 Tentative de connexion échouée: compte anonymisé ${email} (ID: ${user.id})`);
            return res.status(403).json({ message: 'Compte anonymisé. Utilisez le lien de réactivation.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log(`🚫 Tentative de connexion échouée: mot de passe incorrect ${email} (ID: ${user.id})`);
            return res.status(400).json({ message: 'Identifiants invalides.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        await user.update({ last_login: new Date() });
        
        console.log(`✅ Connexion réussie: ${user.pseudo} (${user.email}) - Role: ${user.role}`);
        return res.status(200).json({
            token,
            user: { id: user.id, pseudo: user.pseudo, role: user.role }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};

// — LOGOUT —
exports.logout = async (req, res) => {
    try {
        const token = req.token;
        const decoded = jwt.decode(token);
        
        // Ajouter le token à la blacklist
        await BlacklistedToken.create({
            token,
            user_id: req.user.id,
            expires_at: new Date(decoded.exp * 1000)
        });
        
        console.log(`🚪 Déconnexion: ${req.user.pseudo} (ID: ${req.user.id})`);
        return res.status(200).json({ message: 'Déconnecté avec succès.' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion.', error: err.message });
    }
};

// — FORGOT PASSWORD (génère lien) —
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000); // 1h
        
        console.log(`🔐 Demande de reset password pour ${user.email} (ID: ${user.id})`);

        await user.update({ reset_token: token, reset_token_expires: expires });
        
        // Envoyer l'email avec le lien (à implémenter avec sendMail)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const { sendMail } = require('../scripts/cronRGPD');
        await sendMail({
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe BiblioTech',
            template: 'password_reset',
            resetLink: resetLink,
            userId: user.id
        });
        
        // NE PAS exposer le token dans la réponse HTTP (sécurité)
        return res.status(200).json({ 
            message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' 
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};

// — RESET PASSWORD (via lien) —
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    try {
        if (!newPassword || newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe doivent correspondre.' });
        }
        const user = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expires: { [Op.gte]: new Date() }
            }
        });
        if (!user) return res.status(400).json({ message: 'Token invalide ou expiré.' });

        const hash = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: hash,
            reset_token: null,
            reset_token_expires: null,
            last_login: new Date()
        });
        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};

// — VERIFY REACTIVATE TOKEN (GET) —
exports.verifyReactivate = async (req, res) => {
    const { token } = req.params;
    const u = await User.findOne({
        where: {
            reset_token: token,
            reset_token_expires: { [Op.gte]: new Date() }
        }
    });
    if (!u) return res.status(400).json({ message: 'Token invalide ou expiré.' });
    return res.status(200).json({ valid: true, expiresAt: u.reset_token_expires });
};

// — REACTIVATE & UPDATE CREDS (POST) —
exports.reactivate = async (req, res) => {
    const { token } = req.params;
    const { email, password } = req.body; // confirmPassword déjà validé par express-validator
    try {
        const u = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expires: { [Op.gte]: new Date() }
            }
        });
        if (!u) return res.status(400).json({ message: 'Token invalide ou expiré.' });

        // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur actif
        if (email && email !== u.email) {
            const existingUser = await User.findOne({
                where: { 
                    email: email,
                    is_active: true,
                    id: { [Op.ne]: u.id }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Cette adresse email est déjà utilisée.' });
            }
        }

        const hash = await bcrypt.hash(password, 10);
        await u.update({
            email: email || u.email,
            password: hash,
            last_login: new Date(),
            reset_token: null,
            reset_token_expires: null,
            is_active: true,
            anonymized_at: null // Effacer le marqueur d'anonymisation
        });
        
        console.log(`✅ Compte ${u.pseudo} (ID: ${u.id}) réactivé avec succès`);
        return res.status(200).json({ message: 'Compte réactivé, vous pouvez vous connecter.' });
    } catch (err) {
        console.error('Erreur lors de la réactivation:', err);
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};
