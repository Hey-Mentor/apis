const mongoose = require('mongoose');
const {logger} = require('../logging/logger');

const Users = mongoose.model('User');

exports.getProfileFromFedId = function(fedId) {
    return Users.find({$or: [{'facebook_id': fedId}, {'google_id': fedId}]}, function(err, user) {
        if (err) {
            logger.info('Error getting the user');
            logger.info(err);
            return null;
        } else if (user && user.length > 0) {
            logger.info('Got the user - getProfileFromFedId');
            return user;
        } else {
            logger.info('No matching user');
            return null;
        }
    });
};

exports.getProfileFromUserId = function(userId) {
    return Users.find({'user_id': userId}, function(err, user) {
        if (err) {
            logger.info('Error getting the user');
            logger.info(err);
            return null;
        } else if (user && user.length > 0) {
            logger.info('Got the user - getProfileFromUserId');
            return user;
        } else {
            logger.info('No matching user');
            return null;
        }
    });
};
