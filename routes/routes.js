const passport = require('passport');
const router = require('express').Router();

const auth = require('../middleware/auth');
const chatController = require('../controllers/chat');
const error = require('../middleware/error');
const profileController = require('../controllers/profile');
const registerController = require('../controllers/register');

router.post('/register/facebook', passport.authenticate('facebook-token', { session: false }),
    registerController.register);

router.post('/register/google', passport.authenticate('google-token', { session: false }),
    registerController.register);

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
