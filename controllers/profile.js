const mongoose = require('mongoose');
const {logger} = require('../logging/logger');

const Users = mongoose.model('User');

// WARNING any schema properties in this object will be exposed to other clients,
// do not put sensitive schema properties in this object
const PUBLIC_CONTACT_SCHEMA = {
    person: 1,
    demo: 1,
    gen_interest: 1,
    spec_interests: 1,
    user_type: 1,
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

exports.getContacts = function(req, res) {
    Users.findById(req.user._id, {contacts: 1})
        .then((query) => {
            return Users.find({
                '_id': {$in: query.contacts.map((contact) => new mongoose.Types.ObjectId(contact)),
                }}, PUBLIC_CONTACT_SCHEMA);
        })
        .then((contacts) => {
            res.json(contacts);
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({'Error': 'Something went wrong'});
        });
};
