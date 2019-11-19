const mongoose = require('mongoose');
const uuid = require('uuid/v4');

const { handleMongooseError } = require('../services/errorHandler');
const { logger } = require('../logging/logger');

const User = mongoose.model('User');

exports.createUser = async function (req, res) {
    const {
        fname, lname, user_type, facebook_id, google_id,
    } = req.body;
    try {
        const api_key = uuid().replace(/-/g, '');
        const createdUser = await User.create({
            person: { fname, lname }, user_type, facebook_id, google_id, api_key,
        });
        res.json(createdUser);
    } catch (err) {
        logger.error('Could not create user', err.toString());
        handleMongooseError(err, res);
    }
};
