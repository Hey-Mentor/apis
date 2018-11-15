'use strict';

module.exports = function(app) {
    var mentorController = require('../controllers/mentorController');

// --------------------------------------------------------
//
// TODO: Only deploy "unsecure" versions in PPE, and not PROD
//
    app.route('/unsecure/user/:userId')
        .get(mentorController.get_profile_data_unsecure);

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

/*    app.route('/notifications/:userId/:token')
        .get(mentorController.get_notifications);*/
};
