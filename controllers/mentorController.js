'use strict';

var mongoose = require('mongoose'),
    Mentees = mongoose.model('Mentees'),
    Mentors = mongoose.model('Mentors'),
    Users = mongoose.model('Users');
    //Logins = mongoose.model('Logins'),
    //Notifications = mongoose.model('Notifications');
mongoose.set('debug', true);

var supportedAuthTypes = ["facebook", "google"];
const FACEBOOK_APP_ID = "1650628351692070";
const GOOGLE_APP_ID = "12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com";


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

var get_auth_data_from_idp = function(token, authType) {
    switch (authType) {
        case "facebook":
            return validate_facebook_token(token);
        case "google":
            return validate_google_token(token);
    }
};

/*
* Helper method, called by all secured APIs
* Params:
*   token - the token to authenticate
*   authType - the authentication that was used to get the token (facebook, google, etc.)
*
* Returns:
*   Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid
*
*/
var validate_token = function(token, authType) {
    console.log("Validating token");
    console.log("Token: ");
    console.log(token);
    console.log("authType: ");
    console.log(authType);

    if (!token || !authType){
        return Promise.reject(new Error('AuthType and Token are required to validate token'));
    }

    if (!(supportedAuthTypes.includes(authType))){
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

var get_profile_core = function(userId) {

};

var get_sendbird_channel = function(user1, user2) {

};

exports.print_facebook_token = function(req, res) {
    res.send(req.query);
};



exports.get_profile_data = function(req, res) {

};

exports.get_my_profile_data = function(req, res) {

};

exports.get_messages = function(req, res) {
    // Params: token, userId
};

exports.get_id_token = function(req, res) {
    // Params: fedToken, authType
    console.log("Get ID Token");
    var final_valid_user = validate_token(req.params.fedToken, req.params.authType).then( valid_user => {
        if( valid_user ){
            Users.find( { $or:[ {'facebook_id': valid_user}, {'google_id': valid_user} ]}, function(err, user) {
                if (err)
                    res.send(err);

                return user;
                //var id_token = { "fedToken": "req.params.fedToken", "user_id": mentee.mentee_id, "user_type": "mentee", "authType": "req.params.authType" };
                //return res.json(id_token);
            });
        }else{
            console.log("Invalid token presented to get_id_token");
            return res.send("You must make a request with a valid access token");
        }
    }).catch( error => {
        console.log(error);
        return res.send("Error");
    });

    final_valid_user.then( user => {
        var id_token = { "fedToken": req.params.fedToken, "user_id": user.user_id, "user_type": user.user_type, "authType": req.params.authType };
        return res.json(id_token);
    })
    .catch( error => {
        console.log(error);
        return res.send("Error");
    });
};

//var dateTime = require('node-datetime');

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
