const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('rgpd_warning', 'new_comment', 'book_update', 'system'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: false,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['is_read']
        }
    ]
});

module.exports = Notification; 