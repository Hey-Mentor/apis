
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.authorize = function(req, res, next) {
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