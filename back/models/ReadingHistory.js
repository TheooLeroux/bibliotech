const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const ReadingHistory = sequelize.define('ReadingHistory', {
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
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('to_read', 'reading', 'completed', 'abandoned'),
        allowNull: false
    },
    progress_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    last_page_read: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'reading_history',
    timestamps: false,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['book_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = ReadingHistory; 