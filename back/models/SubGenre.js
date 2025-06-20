// back/models/SubGenre.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.mariadb');

const SubGenre = sequelize.define('sub_genres', {
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
    tableName: 'sub_genres',
    timestamps: false,
    underscored: true
});

module.exports = SubGenre;
