require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Exemple de route
app.get('/', (req, res) => {
    res.send('BiblioTech API');
});

// Démarrage du serveur
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error('Erreur MongoDB', err));
