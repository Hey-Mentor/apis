const mongoose = require('mongoose');
const {logger} = require('../logging/logger');

const Users = mongoose.model('User');

exports.printFacebookToken = function(req, res) {
    res.send(req.query);
};

exports.getProfileData = function(req, res) {
    logger.info('Getting profile data for user');
    logger.info('ID: ' + req.user._id);

    Users.findById(req.user._id)
        .then((data) => res.json(data))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({'Error': 'Something went wrong'});
        });
};

exports.getMyProfileData = function(req, res) {

};

exports.getProfileDataUnsecure = function(req, res) {
};
