const mongoose = require('mongoose');

const { logger } = require('../logging/logger');

const Users = mongoose.model('User');

exports.getProfile = function (req, res) {
    return Users.findById(req.user._id, { api_key: 0 }).orFail(new Error())
        .then(user => res.json(user))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};

exports.updateProfile = function (req, res) {
    return Users.findOneAndUpdate(req.user._id, req.body.user, {
        new: true,
    }).orFail(new Error())
        .then(updated_user => res.status(200).json(updated_user))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};

exports.getContacts = function (req, res) {
    Users.findById(req.user._id, { contacts: 1 }).orFail(new Error())
        .populate('contacts')
        .then(contacts => res.json(contacts))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};
