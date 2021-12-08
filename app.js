const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(`mongodb+srv://${process.env.DB_MONGO_CONNECT}@cluster0.9bue3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(mongoSanitize());
app.use(helmet());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;