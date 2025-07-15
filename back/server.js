// server.js
require('dotenv').config();

const app = require('./app');
const { connectMariaDB } = require('./config/db.mariadb');
const { connectMongoDB } = require('./config/db.mongo');

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

module.exports = app;
