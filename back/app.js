require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('BiblioTech API is running...');
});

module.exports = app;
