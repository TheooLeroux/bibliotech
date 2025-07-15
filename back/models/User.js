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
        unique: false, // Pas de contrainte unique pour permettre les NULL multiples
        validate: { 
            isEmail: {
                args: true,
                msg: 'Must be a valid email'
            },
            isUniqueEmail: async function(value) {
                if (value) { // Seulement vérifier l'unicité si l'email n'est pas null
                    const existingUser = await User.findOne({
                        where: { 
                            email: value,
                            id: { [require('sequelize').Op.ne]: this.id || 0 }
                        }
                    });
                    if (existingUser) {
                        throw new Error('Email already in use');
                    }
                }
            }
        }
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

    avatar_url: DataTypes.STRING,
    bio: DataTypes.TEXT,
    reset_token: DataTypes.STRING,
    reset_token_expires: DataTypes.DATE,
    anonymized_at: DataTypes.DATE
}, {
    timestamps: false
});

module.exports = User;
