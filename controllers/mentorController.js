'use strict';

var mongoose = require('mongoose'),
  Mentees = mongoose.model('Mentees'),
  Mentors = mongoose.model('Mentors');
  //Logins = mongoose.model('Logins'),
  //Notifications = mongoose.model('Notifications');


var validate_token = function(token) {
    console.log("Validating token");
    if (!token){
        return false;
    }

    var fbTokenValidationRequest = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
    const axios = require('axios');

    var responseData = axios.get(fbTokenValidationRequest)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.log(error);
      });

    return responseData.then(data => {
        console.log("Data");
        console.log(data);

        if (!data || !data['data']){
          return false;
        }

        var appId = data['data']['app_id'];
        var isValid = data['data']['is_valid'];
        var correctApp = appId == '1650628351692070';
        return correctApp && isValid;
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
  Mentees.find({ mentee_id: req.params.mentorId }, function(err, mentee) {
    if (err)
      res.send(err);
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