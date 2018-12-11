const mentorController = require('../controllers/mentor');
const auth = require('../middleware/auth');
const tokenController = require('../controllers/token');

module.exports = function(app) {
    // --------------------------------------------------------
    //
    // TODO: Only deploy "unsecure" versions in PPE, and not PROD
    //
    app.route('/unsecure/user/:userId')
        .get(mentorController.getProfileDataUnsecure);

    app.route('/fbaccess')
        .get(mentorController.printFacebookToken);

    // --------------------------------------------------------

    app.use('/', auth.authorize);

    app.route('/token/:authType')
        .get(tokenController.getIdToken);

    app.route('/profile/:userId')
        .get(mentorController.getProfileData);

    app.route('/me')
        .get(mentorController.getMyProfileData);

    app.route('/messages/:userId')
        .get(mentorController.getMessages);

    /*    app.route('/notifications/:userId/:token')
            .get(mentorController.get_notifications);*/
};
