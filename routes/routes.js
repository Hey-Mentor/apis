'use strict';

module.exports = function(app) {
  var mentorController = require('../controllers/mentorController');

  app.route('/mentors/:facebookId')
    .get(mentorController.get_a_mentor);

  app.route('/mentees/:mentorId')
    .get(mentorController.list_all_mentees);

  app.route('/notifications/:userId')
    .get(mentorController.get_notifications);

};