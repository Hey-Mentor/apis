const mongoose = require('mongoose');

const { logger } = require('../logging/logger');

const User = mongoose.model('User');

exports.authorize = function (req, res, next) {
    User.findOne({ _id: req.params.userId, api_key: req.query.token }, { api_key: 0 }).orFail(new Error())
        .then((user) => {
            req.user = user;
            return next();
        }).catch((err) => {
            logger.error(err);
            res.status(401).send('Unauthorized');
        });
};
