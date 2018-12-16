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
        access_token - an authentication token from a supported identity provider (facebook, google)
        req - the HTTP request
        res - the HTTP response
  Returns:
        Provides an HTTP response to the client via "res" parameter

*/
exports.register = function(req, res) {
    const api_key = uuid().replace(/-/g, '');

    switch (req.user.authType) {
        case AUTH_TYPES.FACEBOOK:
            User.find({'facebook_id': req.user.id})
                .then((user) => {
                    User.findOneAndUpdate(user[0]._id, {api_key: api_key}, {new: true})
                        .then((updated_user) => {
                            res.status(201).send({
                                api_key: updated_user.api_key,
                                user_id: updated_user._id,
                                user_type: updated_user.user_type,
                            });
                        })
                        .catch((err) => {
                            res.status(400).send('Found user but could not update');
                        });
                }).catch((err) => {
                    logger.log('info', err);
                    res.status(400).send('Could not find user');
                });
            break;
        case AUTH_TYPES.GOOGLE:
            break;
        default:
            res.status(400).send('Unknown Auth Type');
    }
};
