const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const Favorite = sequelize.define('Favorite', {
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'favorites',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'book_id']
        }
    ]
});

module.exports = Favorite; 