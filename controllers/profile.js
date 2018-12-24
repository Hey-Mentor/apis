const mongoose = require('mongoose');
const { logger } = require('../logging/logger');

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

exports.getProfileData = function (req, res) {
    return res.status(200).json(req.user);
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
