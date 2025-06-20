const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

exports.register = async (req, res) => {
    const { pseudo, email, password } = req.body;

    try {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered.' });

        const existingPseudo = await User.findOne({ where: { pseudo } });
        if (existingPseudo) return res.status(400).json({ message: 'Pseudo already taken.' });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ pseudo, email, password: hashed });

        return res.status(201).json({ message: 'Account created successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        if (!user.is_active) return res.status(403).json({ message: 'Account disabled.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        await user.update({ last_login: new Date() });

        return res.status(200).json({ token, user: { id: user.id, pseudo: user.pseudo, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

exports.logout = (req, res) => {
    return res.status(200).json({ message: 'Logged out (client should clear token).' });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await user.update({ reset_token: token, reset_token_expires: expires });

        const resetLink = `http://localhost:5000/api/auth/reset-password/${token}`;
        return res.status(200).json({ message: 'Reset link generated.', link: resetLink });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: hashed,
            reset_token: null,
            reset_token_expires: null
        });

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
