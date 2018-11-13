'use strict';

var mongoose = require('mongoose'),
  Mentees = mongoose.model('Mentees'),
  Mentors = mongoose.model('Mentors');
  //Logins = mongoose.model('Logins'),
  //Notifications = mongoose.model('Notifications');
mongoose.set('debug', true);

var supportedAuthTypes = ["facebook", "google"];
const FACEBOOK_APP_ID = "1650628351692070";
const GOOGLE_APP_ID = "12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com";


exports.get_id_token = function(req, res) {
  validate_token(req.params.fedToken, req.params.authType).then( valid_user => {
    if( valid_user ){
      Mentees.find( { $or:[ {'facebook_id': valid_user}, {'google_id': valid_user} ]}, function(err, mentee) {
        if (err)
          res.send(err);
        
        var id_token = { "fedToken": req.params.fedToken, "user_id": mentee.mentee_id, "user_type": "mentee", "authType": req.params.authType };
        res.json(id_token);
      });

      Mentors.find({ $or:[ {'facebook_id': valid_user}, {'google_id': valid_user} ]}, function(err, mentor) {
        if (err)
          res.send(err);

        var id_token = { "fedToken": req.params.fedToken, "user_id": mentor.mentor_id, "user_type": "mentor", "authType": req.params.authType };
        res.json(mentor);
      });
    }else{
      console.log("Invalid token presented to get_id_token");
      res.send("You must make a request with a valid access token");  
    }
  });

};


var validate_token = function(token, authType) {
    console.log("Validating token");
    
    if (!token || !authType){
        return false;
    }

    if (!(authType in supportedAuthTypes)){
      console.log("Invalid auth type");
      return false;
    }

    var fbTokenValidationRequest = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
    var googleTokenValidationRequest = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
    const axios = require('axios');

    var responseData;

    switch (authType) {
      case "facebook":
          responseData = axios.get(fbTokenValidationRequest)
            .then(response => {
              return response.data;
            })
            .catch(error => {
              console.log(error);
            });

          break;
      case "google":
        responseData = axios.get(googleTokenValidationRequest)
          .then(response => {
            return response.data;
          })
          .catch(error => {
            console.log(error);
          });


          break;
    }

    return responseData.then(data => {
        console.log("Data");
        console.log(data);

        switch (authType) {
          case "facebook":
            if (!data || !data['data']){
              return false;
            }
            
            var appId = data['data']['app_id'];
            var isValid = data['data']['is_valid'];
            var correctApp = appId == FACEBOOK_APP_ID;
            if (correctApp && isValid){
              return data['data']['user_id'];
            }else{
              return false;
            }

            break;
          case "google":
            if (!data){
              return false;
            }

            var appId = data['aud'];
            var correctApp = appId == GOOGLE_APP_ID;
            if (correctApp){
              return data['user_id'];
            }else{
              return false;
            }

            break;
        }
    }).catch(error => {
        console.log(error);
        return false;
    });;
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