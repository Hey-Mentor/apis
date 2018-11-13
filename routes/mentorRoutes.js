var express = require('express');
var router = express.Router();

// Require controller modules.
var mentorController = require('../controllers/mentorController');

/// MENTOR ROUTES ///
router.get('/mentors/:facebookId', mentorController.get_a_mentor);

/// MENTEE ROUTES ///
router.get('/mentees/:mentorId', mentorController.list_all_mentees);


module.exports = router;
