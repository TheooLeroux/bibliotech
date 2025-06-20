// back/models/MainGenre.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const MainGenre = sequelize.define('main_genres', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'main_genres',
    timestamps: false,
    underscored: true
});

module.exports = MainGenre;
