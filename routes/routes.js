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

    app.route('/unsecure/getmentee/:menteeId')
        .get(mentorController.get_a_mentee_unsecure);

    app.route('/fbaccess')
        .get(mentorController.print_facebook_token);

// --------------------------------------------------------

    app.route('/token/:fedToken/:authType')
        .get(mentorController.get_id_token);

    app.route('/profile/:userId/:token')
        .get(mentorController.get_profile_data);

    app.route('/me/:token')
        .get(mentorController.get_my_profile_data);

    app.route('/messages/:userId/:token')
        .get(mentorController.get_messages);

    app.route('/notifications/:userId/:token')
        .get(mentorController.get_notifications);

};
