const mongoose = require('mongoose');

const { logger } = require('../logging/logger');

const Users = mongoose.model('User');


// WARNING any schema properties in this object will be exposed to other clients,
// do not put sensitive schema properties in this object
const PUBLIC_CONTACT_SCHEMA = {
    user_type: 1,
    person: 1,
    demo: 1,
    gen_interest: 1,
    spec_interests: 1,
    sports: 1,
    school: 1,
};

exports.getProfile = function (req, res) {
    return Users.findById(req.user._id, { api_key: 0 })
        .then(user => res.json(user))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};

exports.getContacts = function (req, res) {
    Users.findById(req.user._id, { contacts: 1 })
        .populate('contacts', PUBLIC_CONTACT_SCHEMA)
        .then(contacts => res.json(contacts))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};
