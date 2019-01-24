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
    contacts: 1,
    school: 1,
};

exports.getProfileData = function (req, res) {
    logger.info('getProfileData');
    return res.status(200).json(req.user);
};

exports.getContacts = function (req, res) {
    logger.info('Getting contacts');
    Users.findById(req.user._id, { contacts: 1 })
        .populate('contacts', PUBLIC_CONTACT_SCHEMA)
        .then((result) => {
            result.contacts = result.contacts.map((contact) => {
                if (contact.contacts.indexOf(req.user._id) < 0) {
                    logger.info('This user should not be returned');
                    return null;
                }
                return contact;
            });
            return result;
        })
        .then(contacts => res.json(contacts))
        .catch((err) => {
            logger.info('An error occurred while processing a getContacts request');
            logger.error(err);
            logger.error(err.stack);
            res.status(500).json({ Error: 'Something went wrong' });
        });
};
