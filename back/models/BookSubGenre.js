// back/models/BookSubGenre.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const BookSubGenre = sequelize.define('book_sub_genres', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sub_genre_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'book_sub_genres',
    timestamps: false,
    underscored: true
});

module.exports = BookSubGenre;
