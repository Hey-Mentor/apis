'use strict';

var mongoose = require('mongoose'),
    Mentees = mongoose.model('Mentees'),
    Mentors = mongoose.model('Mentors'),
    Users = mongoose.model('Users');
mongoose.set('debug', true);

const SUPPORTED_AUTH_TYPES = ["facebook", "google"];
const FACEBOOK_APP_ID = "1650628351692070";
const GOOGLE_APP_ID = "12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com";

/*

 Helper Function
 Used to validate a federated facebook token

 Params:
    token - the token to authenticate

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
var validate_facebook_token = function(token) {
    var fbTokenValidationRequest = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
    const axios = require('axios');

    var responseData = axios.get(fbTokenValidationRequest)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(new Error("Something went wrong during the call to the Facebook token validation endpoint"));
        });

    return responseData.then(data => {
        if (!data || !data['data']){
            return Promise.reject(new Error('No data returned from auth request to Facebook'));
        }

        var appId = data['data']['app_id'];
        var isValid = data['data']['is_valid'];
        var correctApp = appId == FACEBOOK_APP_ID;

        if (correctApp && isValid){
            return data['data']['user_id'];
        }else{
            return Promise.reject(new Error('Token from Facebook does not contain correct app information, or is invalid'));
        }
    })
    .catch(error => {
        console.log(error);
        return Promise.reject(new Error("Something went wrong during the call to the Facebook token validation endpoint"));
    });
};

/*

 Helper Function
 Used to validate a federated google token

 Params:
    token - the token to authenticate

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
var validate_google_token = function(token) {
    var googleTokenValidationRequest = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
    const axios = require('axios');

    var responseData = axios.get(googleTokenValidationRequest)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(new Error("Something went wrong during the call to the Google token validation endpoint"));
        });

    return responseData.then(data => {
        if (!data){
            return Promise.reject(new Error('No data returned from auth request to Google'));
        }

        var appId = data['aud'];
        var correctApp = appId == GOOGLE_APP_ID;

        if (correctApp){
            return data['user_id'];
        }else{
            return Promise.reject(new Error('Token from Google does not contain correct app information, or is invalid'));
        }
    })
    .catch(error => {
        console.log(error);
        return Promise.reject(new Error("Something went wrong during the call to the Google token validation endpoint"));
    });
};

/*

 Helper Function
 Used to validate a federated token of the supplied type

 Params:
    token - the token to authenticate
    authType - the authentication that was used to get the token (facebook, google, etc.)

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
var get_auth_data_from_idp = function(token, authType) {
    switch (authType) {
        case "facebook":
            return validate_facebook_token(token);
        case "google":
            return validate_google_token(token);
    }
};

/*

 Helper Function
 Called by all secured APIs to validate that the supplied federated token is valid

 Params:
    token - the token to authenticate
    authType - the authentication that was used to get the token (facebook, google, etc.)

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
var validate_federated_token = function(token, authType) {
    if (!token || !authType){
        return Promise.reject(new Error('AuthType and Token are required to validate token'));
    }

    if (!(SUPPORTED_AUTH_TYPES.includes(authType))){
        return Promise.reject(new Error('AuthType must be in the supported list of auth types'));
    }

    var userData = get_auth_data_from_idp(token, authType);

    return userData.then(data => {
        console.log("Data");
        console.log(data);
        return data;
    }).catch(error => {
        console.log(error);
        return Promise.reject(new Error('Generic error'));
    });
};


var validate_identity_token = function(token){
    if (!token){
        return Promise.reject(new Error('No valid token found'));
    }

    var decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    console.log("Decoded token");
    console.log(decoded);

    if (!decoded || !decoded.fedToken){
        return Promise.reject(new Error('No valid token found'));
    }

    // TODO: Consider validating that the ID in the federated token matches the same user specified by the user_id in the ID token
    return validate_federated_token(decoded.fedToken, decoded.authType);
};


var get_profile_from_fed_id = function(fedId) {
    return Users.find( { $or:[ {'facebook_id': fedId}, {'google_id': fedId} ]}, function(err, user) {
        if (err){
            console.log("Error getting the user");
            console.log(err);
            return null;
        }else if (user && user.length > 0){
            console.log("Got the user");
            return user;
        }else{
            console.log("No matching user");
            return null;
        }
    });
};

var get_profile_from_user_id = function(userId) {
    return Users.find( {'user_id': userId}, function(err, user) {
        if (err){
            console.log("Error getting the user");
            console.log(err);
            return null;
        }else if (user && user.length > 0){
            console.log("Got the user");
            return user;
        }else{
            console.log("No matching user");
            return null;
        }
    });
};

var get_sendbird_channel = function(user1, user2) {

};

/*
  Helper Function
  Callback function used to return a Hey Mentor Identification token after validation and user lookup is complete.

  Params:
        user - the result of a mongoose call. Should be a user array containing 1 user
        fedToken - the validated authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        res - the HTTP response

*/
var send_id_token_result = function(user, fedToken, authType, res){
    console.log(user);
    var id_token = { "fedToken": fedToken, "user_id": user[0].user_id, "user_type": user[0].user_type, "authType": authType };
    return res.json(id_token);
};


var send_profile_data_result = function(data, res){
    console.log("Sending profile data back:");
    console.log(data);
    return res.json(data);
};


exports.print_facebook_token = function(req, res) {
    res.send(req.query);
};

exports.get_profile_data = function(req, res) {
    validate_identity_token(req.params.token).then( fedId => {
        if( fedId ){
            var user1_req = get_profile_from_fed_id(fedId);
            user1_req.then( user1 => {
                if( user1 ){
                    var user2_req = get_profile_from_user_id(req.params.userId);
                    user2_req.then( user2 => {
                        if ( user2 ){
                            if ( user1[0].contacts.includes(user2[0].user_id)){
                                send_profile_data_result(user2, res);
                            }
                        }
                    });
                }
            });
        }else{
            console.log("Invalid token presented to get_profile_data");
            res.send("You must make a request with a valid access token");
        }
    }).catch( error => {
        console.log(error);
        return res.send("Error");
    });
};

exports.get_my_profile_data = function(req, res) {
    validate_identity_token(req.params.token).then( fedId => {
        if( fedId ){
            var data = get_profile_from_fed_id(fedId);
            data.then( data => {
                console.log("About to send user data back");
                send_profile_data_result(data, res);
            });
        }else{
            console.log("Invalid token presented to get_profile_data");
            res.send("You must make a request with a valid access token");
        }
    }).catch( error => {
        console.log(error);
        return res.send("Error");
    });
};

exports.get_messages = function(req, res) {
    // Params: token, userId
};



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
exports.get_id_token = function(req, res) {
    console.log("Get ID Token");
    validate_federated_token(req.params.fedToken, req.params.authType).then( valid_user => {
        if( valid_user ){
            Users.find( { $or:[ {'facebook_id': valid_user}, {'google_id': valid_user} ]}, function(err, user) {
                if (err){
                    res.send(err);
                    console.log("Error getting the user");
                    console.log(err);
                }else if (user && user.length > 0){
                    console.log("Got the user");
                    send_id_token_result(user, req.params.fedToken, req.params.authType, res);
                }else{
                    console.log("No matching user");
                    res.send("No user");
                }
            });
        }else{
            console.log("Invalid token presented to get_id_token");
            return res.send("You must make a request with a valid access token");
        }
    }).catch( error => {
        console.log(error);
        return res.send("Error");
    });
};



// ------------------------------------------------------------














/*
*
* API list_all_mentees
* Params: mentorId - the unique identifier of a mentee
* Returns: mentee.json - the mentee details for each mentee of the given mentor
*
*/
exports.list_all_mentees = function(req, res) {
    validate_token(req.params.token).then( valid => {
        if( valid ){
            Mentees.find({ mentee_id: req.params.mentorId }, function(err, mentee) {
                if (err)
                    res.send(err);
                res.json(mentee);
            });
        }else{
            console.log("Invalid token presented to list_all_mentees");
            res.send("You must make a request with a valid access token");
        }
    });
};

/*exports.update_user_login = function(req, res) {
    var dt = dateTime.create();
    var formattedTime = dt.format('Y-m-d_H:M:S');
    Logins.findOneAndUpdate({user_id: req.params.userId}, {$set:{last_login:formattedTime}, {new: true}, function(err, user) {
        if (err)
            res.send(err);
        res.json(user);
    });
};*/

exports.get_a_mentor = function(req, res) {
    validate_token(req.params.token).then( valid => {
        if( valid ){
            Mentors.find({facebook_id: req.params.facebookId}, function(err, mentor){
                if (err)
                    res.send(err);
                res.json(mentor);
            });
        }else{
            console.log("Invalid token presented to get_a_mentor");
            res.send("You must make a request with a valid access token");
        }
    });
};

exports.get_notifications = function(req, res) {
    validate_token(req.params.token).then( valid => {
        if( valid ){
            Notifications.find({ mentor_id: req.params.mentorId }, function(err, notifications){
                if (err)
                    res.send(err);
                res.json(notifications);
            });
        }else{
            console.log("Invalid token presented to get_notifications");
            res.send("You must make a request with a valid access token");
        }
    });
};



//
// UNSECURE APIS
//
exports.list_all_mentees_unsecure = function(req, res) {
    Mentors.find({ mentor_id: req.params.mentorId }, function(err, mentee) {
        if (err)
            res.send(err);
        res.json(mentee);
    });
};

exports.get_a_mentee_unsecure = function(req, res) {
    console.log("Trying to get a mentee");
    console.log(req.params.menteeId);
    Mentees.find({ mentee_id: req.params.menteeId }, function(err, mentee) {
        if (err)
            res.send(err);
        console.log(mentee);
        res.json(mentee);
    });
};

exports.get_a_mentor_unsecure = function(req, res) {
    Mentors.find({facebook_id: req.params.facebookId}, function(err, mentor){
        if (err)
            res.send(err);
        res.json(mentor);
    });
};

exports.get_notifications_unsecure = function(req, res) {
    Notifications.find({ mentor_id: req.params.mentorId }, function(err, notifications){
        if (err)
            res.send(err);
        res.json(notifications);
    });
};
