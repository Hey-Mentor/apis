const {logger} = require('../logging/logger');
const profile = require('../util/profile');

function sendProfileDataResult(data, res) {
    logger.log('info', 'Sending profile data back:');
    logger.log('info', data);
    return res.json(data);
}

exports.printFacebookToken = function(req, res) {
    res.send(req.query);
};

exports.getProfileData = function(req, res) {
    const user1_req = profile.getProfileFromFedId(req.fedId);
    user1_req.then((user1) => {
        if (user1) {
            const user2_req = profile.getProfileFromUserId(req.params.userId);
            user2_req.then((user2) => {
                if (user2) {
                    if (user1[0].contacts.includes(user2[0].user_id)) {
                        sendProfileDataResult(user2, res);
                    }
                }
            });
        }
    });
};

exports.getMyProfileData = function(req, res) {
    const data = profile.getProfileFromFedId(req.fedId);
    data.then((data) => {
        logger.log('info', 'About to send user data back');
        sendProfileDataResult(data, res);
    });
};

exports.getProfileDataUnsecure = function(req, res) {
};
