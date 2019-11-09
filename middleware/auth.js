const mongoose = require('mongoose');
const crypto = require("crypto");

const User = mongoose.model('User');

function GetPasswordHash(rawPassword) {
    return crypto
        .createHash("sha256")
        .update(rawPassword)
        .digest("hex");
}

exports.authorize = function (req, res, next) {
    let authMode = req.headers['x-auth-mode'];
    if (authMode && authMode === 'Basic')
    {
        let authHeader = req.headers.authorization.replace("Basic ", "");
        let decoded = Buffer.from(authHeader, 'base64').toString();
        let splitParts = decoded.split(':');
        let username = splitParts[0];
        let password = GetPasswordHash(splitParts[1]);

        User.findOne({ _id: req.params.userId, username: username }, { api_key: 0 })
        .orFail(new Error())
        .then((user) => {
            if (user.password !== password)
            {
                res.status(401).send('Unauthorized');
            }

            req.user = user;
            return next();
        }).catch(() => {
            res.status(401).send('Unauthorized');
        });
    }
    else {
        User.findOne({ _id: req.params.userId, api_key: req.query.token }, { api_key: 0 })
        .orFail(new Error())
        .then((user) => {
            req.user = user;
            return next();
        }).catch(() => {
            res.status(401).send('Unauthorized');
        });
    }
};
