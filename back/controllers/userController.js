const { User } = require('../models');

// GET /users — admin only
exports.getAll = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /users/:id — owner OR admin
exports.getOne = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);
        if (req.user.id !== targetId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const user = await User.findByPk(targetId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /users/:id — owner OR admin
exports.update = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);
        if (req.user.id !== targetId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const user = await User.findByPk(targetId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updates = { ...req.body };
        if (req.file) {
            updates.avatar = req.file.filename;
        }

        await user.update(updates);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /users/:id — admin only
exports.remove = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.destroy();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
