const passport = require('passport');
const router = require('express').Router();

const auth = require('../middleware/auth');
const chatController = require('../controllers/chat');
const credentialsController = require('../controllers/credentials');
const error = require('../middleware/error');
const profileController = require('../controllers/profile');

router.post('/register/facebook', passport.authenticate('facebook-token', { session: false }),
    credentialsController.facebookRegister);

router.get('/login/facebook', passport.authenticate('facebook-token', { session: false }),
    credentialsController.facebookLogin);

router.post('/register/google', passport.authenticate('google-token', { session: false }),
    credentialsController.googleRegister);

/**
 *
 * ALL SECURE ENDPOINTS MUST GO AFTER THE AUTHORIZE MIDDLEWARE
 *
 * */
router.use('/*/:userId', auth.authorize);

/** ****************PLACE OTHER ROUTES BELOW******************* */

router.route('/profile/:userId')
    .get(profileController.getProfile)
    .put(profileController.updateProfile);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.route('/chat/token/:userId')
    .post(chatController.createToken);

router.route('/chat/create/:userId')
    .post(chatController.createTwilioUser);

router.route('/chat/channel/create/:userId')
    .post(chatController.createTwilioChannel);

router.route('/chat/channel/messages/:userId')
    .post(chatController.fetchMessages);

router.all('*', (req, res) => {
    res.status(404).send();
});

router.use(error.error);

module.exports = router;
