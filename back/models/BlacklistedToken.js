const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const BlacklistedToken = sequelize.define('BlacklistedToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    blacklisted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'blacklisted_tokens',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['expires_at']
        }
    ]
});

module.exports = BlacklistedToken; 