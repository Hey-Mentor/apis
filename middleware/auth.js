const {logger} = require('../logging/logger');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.authorize = function(req, res, next) {
    logger.log('info', 'Authorize');
    //logger.log('info', req);
    logger.log('info', 'UserID: ' + req.params.userId);
    
    User.findById(req.params.userId)
        .then((user) => {
            if (user.api_key === req.query.token) {
                req.user = user;
                next();
            } else {
                return res.status(401).send('Unauthorized');
            }
        }).catch((err) => {
            return res.status(401).send('Unauthorized');
        });
};
