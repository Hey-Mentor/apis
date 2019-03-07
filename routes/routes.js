const passport = require('passport');
const router = require('express').Router();

const auth = require('../middleware/auth');
const credentialsController = require('../controllers/credentials');
const error = require('../middleware/error');
const profileController = require('../controllers/profile');

router.post('/register/facebook', passport.authenticate('facebook-token', { session: false }),
    credentialsController.facebookRegister);

router.get('/login/facebook', passport.authenticate('facebook-token', { session: false }),
    credentialsController.facebookLogin);

router.post('/register/google', passport.authenticate('google-token', { session: false }),
    credentialsController.googleRegister);

router.use('/*/:userId', auth.authorize);

router.route('/profile/:userId')
    .get(profileController.getProfileData);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.use(error.error);

module.exports = router;
