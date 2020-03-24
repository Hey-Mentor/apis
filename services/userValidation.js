const mongoose = require('mongoose');

const Users = mongoose.model('User');
const { logger } = require('../logging/logger');

exports.UserHasTwilioContext = function (userId) {
    return Users.findById(userId, { api_key: 0 })
        .orFail(new Error())
        .then(
            user => user.chat.twilioInit === 'true',
        )
        .catch((err) => {
            logger.error(err.toString());
            return false;
        });
};

exports.MarkUserInitialized = function (userId) {
    return Users.findOneAndUpdate(userId, {
        chat: { twilioInit: 'true' },
    })
        .orFail(new Error())
        .catch((err) => {
            logger.error(err.toString());
            return false;
        });
};
