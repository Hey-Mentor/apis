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
router.use('/admin/*/', auth.adminAuthorize);

/** ****************PLACE ADMIN ROUTES BELOW******************* */
router.route('/admin/chat/channel/create/')
    .post(chatController.createChatChannel);

router.route('/admin/chat/create/')
    .post(chatController.createChatUser);

/** ****************PLACE NON-ADMIN, SECURE ROUTES BELOW******************* */

router.use('/*/:userId', auth.authorize);

router.route('/profile/:userId')
    .get(profileController.getProfile)
    .put(profileController.updateProfile);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.route('/chat/token/:userId')
    .post(chatController.createToken);

router.all('*', (req, res) => {
    res.status(404).send();
});

router.use(error.error);

module.exports = router;
