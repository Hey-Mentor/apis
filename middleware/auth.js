const mongoose = require('mongoose');

const User = mongoose.model('User');

exports.authorize = function (req, res, next) {
    User.findOne({ _id: req.params.userId, api_key: req.query.token, }, { api_key: 0, })
        .orFail(new Error())
        .then((user) => {
            req.user = user;
            return next();
        }).catch(() => {
            res.status(401).send('Unauthorized');
        });
};
exports.adminAuthorize = function(req, res, next){
    User.findOne (
        {
            _id: req.params.userId,
            user_type: 'admin',
            api_key: req.query.token,
        },
        { api_key: 0 }
        ).orFail(new Error())
        .then((user) => {
            req.user = user;
            return next();
        }).catch((er) => {
            res.status(401).send('Unauthorized');
        });
}