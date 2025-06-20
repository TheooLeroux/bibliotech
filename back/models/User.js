const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pseudo: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true }
    },
    password: DataTypes.STRING,
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_login: DataTypes.DATE,
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    reactivation_date: DataTypes.DATE,
    avatar_url: DataTypes.STRING,
    bio: DataTypes.TEXT
}, {
    timestamps: false
});

module.exports = User;
