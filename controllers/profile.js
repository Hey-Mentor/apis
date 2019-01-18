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
};

exports.getProfileData = function (req, res) {
    return res.status(200).json(req.user);
};

exports.getContacts = function (req, res) {
    if (req.user.user_type === 'mentor') {
        Users.findById(req.user._id, { contacts: 1 })
            .populate('contacts', Object.assign({}, PUBLIC_CONTACT_SCHEMA, { school: 1 }))
            .then((result) => {
                result.contacts = result.contacts.map((contact) => {
                    if (contact.user_type === 'mentor') {
                        contact.school = undefined;
                    }
                    return contact;
                });
                return result;
            })
            .then(contacts => res.json(contacts))
            .catch((err) => {
                logger.error(err);
                res.status(500).json({ Error: 'Something went wrong' });
            });
    } else {
        Users.findById(req.user._id, { contacts: 1 })
            .populate('contacts', PUBLIC_CONTACT_SCHEMA)
            .then(contacts => res.json(contacts))
            .catch((err) => {
                logger.error(err);
                res.status(500).json({ Error: 'Something went wrong' });
            });
    }
};
