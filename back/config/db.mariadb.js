const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mariadb',
        logging: false, // Passe à true si tu veux voir les requêtes SQL
        define: {
            timestamps: true,
            freezeTableName: true
        }
    }
);

const connectMariaDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MariaDB connecté avec succès.');
    } catch (error) {
        console.error('❌ Erreur de connexion à MariaDB :', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectMariaDB };
