const { logger } = require('../logging/logger');
const profile = require('../util/profile');
const sendbird = require('../util/sendbird');

/*
  Helper Function
  Callback function used to return a Hey Mentor Identification token after validation and user lookup is complete.

  Params:
        user - the result of a mongoose call. Should be a user array containing 1 user
        fedToken - the validated authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        res - the HTTP response

*/

function sendProfileDataResult(data, res) {
    logger.log('info', 'Sending profile data back:');
    logger.log('info', data);
    return res.json(data);
}

function sendChannelDataResult(channel_url, res) {
    logger.log('info', 'Sending channel id back:');
    const channel_data = { 'channel_url': channel_url };
    logger.log('info', channel_data);
    return res.json(channel_data);
}

exports.printFacebookToken = function (req, res) {
    res.send(req.query);
};

exports.getProfileData = function (req, res) {
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

exports.getMyProfileData = function (req, res) {
    const data = profile.getProfileFromFedId(req.fedId);
    data.then((data) => {
        logger.log('info', 'About to send user data back');
        sendProfileDataResult(data, res);
    });
};

exports.getMessages = function (req, res) {
    const user1_req = profile.getProfileFromFedId(req.fedId);
    user1_req.then((user1) => {
        if (user1) {
            const user2_req = profile.getProfileFromUserId(req.params.userId);
            user2_req.then((user2) => {
                if (user2) {
                    if (user1[0].contacts.includes(user2[0].user_id)) {
                        const channel = sendbird.getSendbirdChannel(user1, user2);
                        channel.then((channel_url) => {
                            sendChannelDataResult(channel_url, res);
                        });
                    }
                }
            });
        }
    });
};

exports.getProfileDataUnsecure = function (req, res) {
};
