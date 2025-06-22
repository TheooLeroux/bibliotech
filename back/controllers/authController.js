const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');

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
        if (!user) return res.status(400).json({ message: 'Identifiants invalides.' });
        if (!user.is_active) return res.status(403).json({ message: 'Compte désactivé.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Identifiants invalides.' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        await user.update({ last_login: new Date() });
        return res.status(200).json({
            token,
            user: { id: user.id, pseudo: user.pseudo, role: user.role }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};

// — LOGOUT —
exports.logout = (req, res) => {
    return res.status(200).json({ message: 'Déconnecté. Pensez à supprimer le token côté client.' });
};

// — FORGOT PASSWORD (génère lien) —
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000); // 1h

        await user.update({ reset_token: token, reset_token_expires: expires });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        // ici tu peux appeler sendMail() si tu as un utilitaire
        return res.status(200).json({ message: 'Lien de réinitialisation généré.', link: resetLink });
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
                reset_token_expires: { [Op.gt]: new Date() }
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
    const { email, password, confirmPassword } = req.body;
    try {
        if (!password || password !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe doivent correspondre.' });
        }
        const u = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expires: { [Op.gte]: new Date() }
            }
        });
        if (!u) return res.status(400).json({ message: 'Token invalide ou expiré.' });

        const hash = await bcrypt.hash(password, 10);
        await u.update({
            email: email || u.email,
            password: hash,
            last_login: new Date(),
            reset_token: null,
            reset_token_expires: null,
            is_active: true
        });
        return res.status(200).json({ message: 'Compte réactivé, vous pouvez vous connecter.' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
};
