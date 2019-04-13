const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const mongoose = require('mongoose');
const passport = require('passport');
const uuid = require('uuid/v4');

const { logger } = require('../logging/logger');

const User = mongoose.model('User');

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const GOOGLE_APP_ID = process.env.GOOGLE_APP_ID;

// Schema properties returned to client
const REGISTER_SCHEMA = {
    api_key: 1,
    _id: 1,
    user_type: 1,
};

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
}, ((accessToken, refreshToken, profile, done) => done(null, profile))));

passport.use(new GoogleTokenStrategy({
    clientID: GOOGLE_APP_ID,
    clientSecret: '',
}, ((accessToken, refreshToken, profile, done) => done(null, profile))));

/*

  API Surface
  Exchanges a federated identity token (facebook, google) for a Hey Mentor identification token
  The Hey Mentor ID token is used for all subsequent API calls requiring authentication.

  Params:
        access_token - an authentication token from a supported identity provider (facebook, google)
        req - the HTTP request
        res - the HTTP response
  Returns:
        Provides an HTTP response to the client via "res" parameter

*/

exports.facebookRegister = function (req, res) {
    return User.findOne({ facebook_id: req.user.id }, REGISTER_SCHEMA).orFail(new Error())
        .then((user) => {
            const api_key = uuid().replace(/-/g, '');
            return User.findOneAndUpdate({ _id: user._id }, { api_key }, {
                new: true,
                select: REGISTER_SCHEMA,
                strict: true,
            }).orFail(new Error())
                .then(updated_user => res.status(201).json(updated_user))
                .catch((err) => {
                    logger.error('Found user but could not update', err);
                    res.sendStatus(400);
                });
        })
        .catch((err) => {
            logger.error('Could not find user', err);
            res.sendStatus(400);
        });
};

exports.facebookLogin = function (req, res) {
    return User.findOne({ facebook_id: req.user.id }, REGISTER_SCHEMA).orFail(new Error())
        .then((user) => {
            if (!user.api_key) {
                return res.status(400).json({ status: 'Must register first' });
            }
            return res.json(user);
        })
        .catch((err) => {
            logger.error('Error occurred during find user', err);
            res.sendStatus(400);
        });
};

exports.googleRegister = function (req, res) {
    return res.sendStatus(500);
};
