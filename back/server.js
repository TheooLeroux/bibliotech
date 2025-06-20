require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const { connectMariaDB } = require('./config/db.mariadb');
const { connectMongoDB } = require('./config/db.mongo');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


// Route test
app.get('/', (req, res) => {
    res.send('BiblioTech API is running...');
});

// Lancement serveur + connexions BDD
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectMariaDB();
    await connectMongoDB();
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
