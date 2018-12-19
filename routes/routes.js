const passport = require('passport');

const messageController = require('../controllers/message');
const registerController = require('../controllers/register');
const profileController = require('../controllers/profile');
const auth = require('../middleware/auth');
const error = require('../middleware/error');

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

    app.post('/register/facebook', passport.authenticate('facebook-token', {session: false}),
        registerController.register);

    app.post('/register/google', passport.authenticate('google-token', {session: false}),
        registerController.register);

    app.use('/*/:userId', auth.authorize);

    app.route('/profile/:userId')
        .get(profileController.getProfileData);

    app.route('/messages/:userId')
        .get(messageController.getMessages);

    /*    app.route('/notifications/:userId/:token')
            .get(mentorController.get_notifications);*/

    app.use(error.error);
};
