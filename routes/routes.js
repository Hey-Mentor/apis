const passport = require('passport');
const router = require('express').Router();

const messageController = require('../controllers/message');
const registerController = require('../controllers/register');
const profileController = require('../controllers/profile');
const auth = require('../middleware/auth');
const error = require('../middleware/error');

// --------------------------------------------------------
//
// TODO: Only deploy "unsecure" versions in PPE, and not PROD
//
/*
    app.route('/unsecure/user/:userId')
        .get(profileController.getProfileDataUnsecure);

    app.route('/fbaccess')
        .get(profileController.printFacebookToken);
    */
// --------------------------------------------------------

router.post('/register/facebook', passport.authenticate('facebook-token', { session: false }),
    registerController.register);

router.post('/register/google', passport.authenticate('google-token', { session: false }),
    registerController.register);

router.use('/*/:userId', auth.authorize);

router.route('/profile/:userId')
    .get(profileController.getProfileData);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.route('/messages/:userId')
    .get(messageController.getMessages);

/*    router.route('/notifications/:userId/:token')
            .get(mentorController.get_notifications); */

router.use(error.error);

module.exports = router;
