const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 10*60*1000,
    max: 100,
    message: 'Trop de requêtes effectuées. Réessayer dans une heure.'
})