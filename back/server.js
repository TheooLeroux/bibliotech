// server.js
require('dotenv').config();

const app = require('./app');
const { connectMariaDB } = require('./config/db.mariadb');
const { connectMongoDB } = require('./config/db.mongo');

// On importe l'instance Sequelize depuis le dossier models
const { sequelize } = require('./models');

// --------------
// On attache sequelize sur app pour que les tests
// puissent faire : const { sequelize } = require('../server');
// --------------
app.sequelize = sequelize;

const PORT = process.env.PORT || 5000;

// Ne lancer le serveur que si on exécute directement `node server.js`
if (require.main === module) {
    (async () => {
        try {
            // Connexion à MariaDB
            await connectMariaDB();
            console.log('✅ MariaDB connecté avec succès.');

            // Connexion à MongoDB
            await connectMongoDB();
            console.log('✅ MongoDB connecté avec succès.');

            // On écoute enfin les requêtes HTTP
            app.listen(PORT, () => {
                console.log(`🚀 Serveur lancé sur le port ${PORT}`);
            });
        } catch (err) {
            console.error('❌ Erreur lors du démarrage :', err);
            process.exit(1);
        }
    })();
}

// On exporte l'app (avec la propriété sequelize) pour Supertest
module.exports = app;
