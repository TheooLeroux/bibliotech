const bcrypt = require('bcryptjs');
const fs = require('fs');
const { Op } = require('sequelize');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] }
        });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const updateData = {};

        if ('pseudo' in req.body && req.body.pseudo.trim()) {
            // Vérifier si le pseudo est pris par un autre
            const other = await User.findOne({
                where: {
                    pseudo: req.body.pseudo,
                    id: { [Op.ne]: userId }
                }
            });
            if (other) return res.status(400).json({ message: 'Pseudo already taken by another user.' });
            updateData.pseudo = req.body.pseudo;
        }

        if ('bio' in req.body && req.body.bio.trim()) {
            updateData.bio = req.body.bio;
        }

        if ('email' in req.body) {
            return res.status(400).json({ message: 'Email cannot be modified.' });
        }

        if (req.file) {
            if (user.avatar_url && fs.existsSync(user.avatar_url)) {
                fs.unlinkSync(user.avatar_url);
            }
            updateData.avatar_url = req.file.path;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided.' });
        }

        await user.update(updateData);

        return res.status(200).json({ message: 'Profile updated.', updated: updateData });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};



// 1. Total users
exports.getUserCount = async (req, res) => {
    try {
        const count = await User.count();
        return res.status(200).json({ total: count });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// 2. Check pseudo dispo
exports.checkPseudo = async (req, res) => {
    const { pseudo } = req.params;
    try {
        const user = await User.findOne({ where: { pseudo } });
        return res.status(200).json({ available: !user });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
// 2. Check email dispo
exports.checkEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ where: { email } });
        return res.status(200).json({ available: !user });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};


