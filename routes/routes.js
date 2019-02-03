const passport = require('passport');
const router = require('express').Router();

const auth = require('../middleware/auth');
const credentialsController = require('../controllers/credentials');
const chatController = require('../controllers/chat');
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
 * ALL OTHER ENDPOINTS MUST GO AFTER THE AUTHORIZE MIDDLEWARE
 *
 * */
router.use('/*/:userId', auth.authorize);

/** ****************PLACE OTHER ROUTING BELOW******************* */

router.route('/profile/:userId')
    .get(profileController.getProfile);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.route('/chat/:userId')
    .post(chatController.createChat);

router.all('*', (req, res) => {
    res.status(404).send();
});

router.use(error.error);

module.exports = router;
