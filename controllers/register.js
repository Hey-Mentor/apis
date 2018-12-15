const uuid = require('uuid/v4');
const passport = require('passport');
const mongoose = require('mongoose');

const {logger} = require('../logging/logger');
const User = mongoose.model('User');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const FACEBOOK_APP_ID = '1650628351692070';
const GOOGLE_APP_ID = '12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com';
const AUTH_TYPES = {
    FACEBOOK: 'facebook',
    GOOGLE: 'google',
};

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: '',
}, function(accessToken, refreshToken, profile, done) {
    profile.authType = AUTH_TYPES.FACEBOOK;
    return done(null, profile);
}));

passport.use(new GoogleTokenStrategy({
    clientID: GOOGLE_APP_ID,
    clientSecret: '',
},
function(accessToken, refreshToken, profile, done) {
    profile.authType = AUTH_TYPES.GOOGLE;
    return done(null, profile);
}
));
/*

  API Surface
  Exchanges a federated identity token (facebook, google) for a Hey Mentor identification token
  The Hey Mentor ID token is used for all subsequent API calls requiring authentication.

  Params:
        fedToken - an authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        req - the HTTP request
        res - the HTTP response
  Returns:
        Provides an HTTP response to the client via "res" parameter

*/
exports.register = function(req, res) {
    const api_key = uuid().replace(/-/g, '');
    const user = {
        user_type: req.body['user_type'],
        api_key: api_key,
    };

    switch (req.user.authType) {
        case AUTH_TYPES.FACEBOOK:
            user.facebook_id = req.user.id;
            user.person = {
                fname: req.user.name.givenName,
                lname: req.user.name.familyName,
            };
            break;
        case AUTH_TYPES.GOOGLE:
            break;
        default:
            res.status(400).send('Unknown Auth Type');
    }
    User.create(user).then((user) => {
        res.status(201).send({api_key: user.api_key, user_id: user._id});
    }).catch((err) => {
        logger.log('info', err);
        res.status(400).send('Could not register user');
    });
};
