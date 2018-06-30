'use strict';

var mongoose = require('mongoose'),
  Mentees = mongoose.model('Mentees'),
  Mentors = mongoose.model('Mentors');
  //Logins = mongoose.model('Logins'),
  //Notifications = mongoose.model('Notifications');

//var dateTime = require('node-datetime');

/*
*
* API list_all_mentees 
* Params: mentorId - the unique identifier of a mentee
* Returns: mentee.json - the mentee details for each mentee of the given mentor
*
*/
exports.list_all_mentees = function(req, res) {
  Mentees.find({ mentee_id: req.params.mentorId }, function(err, mentee) {
    if (err)
      res.send(err);
    res.json(mentee);
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
  Mentors.find({facebook_id: req.params.facebookId}, function(err, mentor){
    if (err)
      res.send(err);
    res.json(mentor);
  });
};

exports.get_notifications = function(req, res) {
  Notifications.find({ mentor_id: req.params.mentorId }, function(err, notifications){
    if (err)
      res.send(err);
    res.json(notifications);
  });
};