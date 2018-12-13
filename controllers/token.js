const mongoose = require('mongoose');
const {logger} = require('../logging/logger');
const Users = mongoose.model('Users');

/*
  Helper Function
  Callback function used to return a Hey Mentor Identification token after validation and user lookup is complete.

  Params:
        user - the result of a mongoose call. Should be a user array containing 1 user
        fedToken - the validated authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        res - the HTTP response

*/

function sendIdTokenResult(user, fedToken, authType, res) {
    logger.log('info', 'Sending ID Token');
    const id_token = {'fedToken': fedToken, 'user_id': user[0].user_id, 'user_type': user[0].user_type, 'authType': authType};
    logger.log('info', id_token);
    return res.json(id_token);
}

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
exports.getIdToken = function(req, res) {
    Users.find({$or: [{'facebook_id': req.fedId}, {'google_id': req.fedId}]}, function(err, user) {
        if (err) {
            logger.log('info', 'Error getting the user');
            logger.log('info', err);
            return res.send(err);
        } else if (user && user.length > 0) {
            logger.log('info', 'Got the user - get_id_token');
            return sendIdTokenResult(user, req.params.fedToken, req.params.authType, res);
        } else {
            logger.log('info', 'No matching user');
            return res.send('No user');
        }
    });
};
