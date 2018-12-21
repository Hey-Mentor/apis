const mongoose = require('mongoose');
const { logger } = require('../logging/logger');

const User = mongoose.model('User');

exports.authorize = function (req, res, next) {
    logger.info('Authorize');
    logger.info(`UserID: ${req.params.userId}`);

    User.findById(req.params.userId)
        .then((user) => {
            if (user.api_key === req.query.token) {
                req.user = user;
                next();
            } else {
                return res.status(401).send('Unauthorized');
            }
        }).catch((err) => {
            logger.error(err);
            res.status(401).send('Unauthorized');
        });
};
