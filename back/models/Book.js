// models/Book.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const Book = sequelize.define('books', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    publication_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    file_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mongo_doc_id: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    is_young_author: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    cover_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    visibility: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: true,
        defaultValue: 'public'
    },
    read_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    download_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    main_genre_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'books',
    timestamps: true,
    underscored: true
});

module.exports = Book;
