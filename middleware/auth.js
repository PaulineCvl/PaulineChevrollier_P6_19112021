const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.DB_SECRET_TOKEN);
        const userId = decodedToken.userId;
        if(req.body.userId && req.body.userId !== userId) {
            throw '403: unauthorized request';
        } else {
            next();
        }
    } catch(error) {
        res.status(401).json({error: error | 'Requête non authentifiée'});
    }
}