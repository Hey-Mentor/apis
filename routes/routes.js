'use strict';

module.exports = function(app) {
  var mentorController = require('../controllers/mentorController');

// --------------------------------------------------------
//
// TODO: Only deploy "unsecure" versions in PPE, and not PROD 
//
  app.route('/unsecure/mentors/:userId')
    .get(mentorController.get_a_mentor_unsecure);

  app.route('/unsecure/mentees/:mentorId')
    .get(mentorController.list_all_mentees_unsecure);

  app.route('/unsecure/notifications/:userId')
    .get(mentorController.get_notifications_unsecure);
// --------------------------------------------------------

  app.route('/mentors/:userId/:token')
    .get(mentorController.get_a_mentor);

  app.route('/mentees/:mentorId/:token')
    .get(mentorController.list_all_mentees);

  app.route('/notifications/:userId/:token')
    .get(mentorController.get_notifications);
};