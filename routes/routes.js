const passport = require('passport');
const router = require('express').Router();

const auth = require('../middleware/auth');
const error = require('../middleware/error');
const profileController = require('../controllers/profile');
const registerController = require('../controllers/register');

router.post('/register/facebook', passport.authenticate('facebook-token', { session: false }),
    registerController.register);

router.post('/register/google', passport.authenticate('google-token', { session: false }),
    registerController.register);

router.use('/*/:userId', auth.authorize);

router.route('/profile/:userId')
    .get(profileController.getProfileData);

router.route('/contacts/:userId')
    .get(profileController.getContacts);

router.use(error.error);

module.exports = router;
