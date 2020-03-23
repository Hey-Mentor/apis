const mongoose = require('mongoose');

const Users = mongoose.model('User');
const { logger } = require('../logging/logger');

exports.ValidateChatUser = function (userId, isInitialized) {
    return Users.findById(userId, { api_key: 0 })
        .orFail(new Error())
        .then(
            user => (user.user_type === 'mentor' || user.user_type === 'mentee')
        && user.chat.twilioInit === isInitialized,
        )
        .catch((err) => {
            logger.error(err.toString());
            return false;
        });
};

exports.InitChatUser = function (userId) {
    return Users.findOneAndUpdate(userId, {
        chat: { twilioInit: true },
    })
        .orFail(new Error())
        .catch((err) => {
            logger.error(err.toString());
            return false;
        });
};
