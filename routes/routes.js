const messageController = require('../controllers/message');
const tokenController = require('../controllers/token');
const profileController = require('../controllers/profile');
const auth = require('../middleware/auth');

module.exports = function(app) {
    // --------------------------------------------------------
    //
    // TODO: Only deploy "unsecure" versions in PPE, and not PROD
    //
    app.route('/unsecure/user/:userId')
        .get(profileController.getProfileDataUnsecure);

    app.route('/fbaccess')
        .get(profileController.printFacebookToken);

    // --------------------------------------------------------

    app.use('/', auth.authorize);

    app.route('/token/:authType')
        .get(tokenController.getIdToken);

    app.route('/profile/:userId')
        .get(profileController.getProfileData);

    app.route('/me')
        .get(profileController.getMyProfileData);

    app.route('/messages/:userId')
        .get(messageController.getMessages);

    /*    app.route('/notifications/:userId/:token')
            .get(mentorController.get_notifications);*/
};
