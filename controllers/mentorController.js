const axios = require('axios');
const mongoose = require('mongoose');

const profile = require('../util/profile');
const Users = mongoose.model('Users');

function getSendBirdUser(userId) {
    // We will use the Hey Mentor user ID as the SendBird user ID
    // Check if the user was already created in SendBird, otherwise, create it
    return checkSendBirdUserExists(userId).then((exists) => {
        if (exists) {
            return userId;
        } else {
            createSendBirdUser(userId, 'Nickname').then((created) => {
                if (created) {
                    return userId;
                } else {
                    console.log('Something went wrong when trying to get the SendBird user');
                    return null;
                }
            });
        }
    });
    /* profile.getProfileFromUserId(userId).then( user => {
        if ( user && user.sendbird_id ){
            return user.sendbird_id
        }else{
            // Create the user through SendBird, and update the DB
            // Note that we should block on DB update before using the new SendBird user
        }
    });*/
}

function checkSendBirdUserExists(userId) {
    console.log('Does SendBird user exist?');

    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.get(`https://api.sendbird.com/v3/users/${userId}`, config)
        .then((response) => {
            if (response && response.data && !response.data.error) {
                console.log('Yes');
                return true;
            }
            console.log('Nope');
            return false;
        })
        .catch((error) => {
            console.log('Nope');
            return false;
        });
}

function createSendBirdUser(userId, name) {
    const data = {user_id: userId, nickname: name, profile_url: '', profile_file: ''};
    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.post(`https://api.sendbird.com/v3/users`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            console.log('Error during createSendBirdUser');
        });
}

function createSendBirdChannel(userIds) {
    // Note: we must use 'is_distinct': true in order to get the existing channel returned
    const data = {user_ids: userIds, is_distinct: true};
    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.post(`https://api.sendbird.com/v3/group_channels`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            console.log('Error during createSendBirdChannel');
        });
}

const getSendbirdChannel = function(user1, user2) {
    const user1_final = getSendBirdUser(user1[0].user_id);
    const user2_final = getSendBirdUser(user2[0].user_id);

    return Promise.all([user1_final, user2_final]).then((values) => {
        const users = [values[0], values[1]];
        console.log('users:');
        console.log(users);

        const channel_data = createSendBirdChannel(users);
        return channel_data.then((data) => {
            if (data) {
                if (data.channel_url) {
                    console.log(data.channel_url);
                    return data.channel_url;
                }
                console.log('A response was received from SendBird, but we couldn\'t parse the channel URL');
            } else {
                console.log('No response returned from SendBird');
            }

            return null;
        });
    });
};

/*
  Helper Function
  Callback function used to return a Hey Mentor Identification token after validation and user lookup is complete.

  Params:
        user - the result of a mongoose call. Should be a user array containing 1 user
        fedToken - the validated authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        res - the HTTP response

*/
function sendIdTokenResult(user, fedToken, authType, res) {
    console.log('Sending ID Token');
    const id_token = {'fedToken': fedToken, 'user_id': user[0].user_id, 'user_type': user[0].user_type, 'authType': authType};
    console.log(id_token);
    return res.json(id_token);
}

function sendProfileDataResult(data, res) {
    console.log('Sending profile data back:');
    console.log(data);
    return res.json(data);
}

function sendChannelDataResult(channel_url, res) {
    console.log('Sending channel id back:');
    const channel_data = {'channel_url': channel_url};
    console.log(channel_data);
    return res.json(channel_data);
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
        console.log('About to send user data back');
        sendProfileDataResult(data, res);
    });
};

exports.getMessages = function(req, res) {
    const user1_req = profile.getProfileFromFedId(req.fedId);
    user1_req.then((user1) => {
        if (user1) {
            const user2_req = profile.getProfileFromUserId(req.params.userId);
            user2_req.then((user2) => {
                if (user2) {
                    if (user1[0].contacts.includes(user2[0].user_id)) {
                        const channel = getSendbirdChannel(user1, user2);
                        channel.then((channel_url) => {
                            sendChannelDataResult(channel_url, res);
                        });
                    }
                }
            });
        }
    });
};

/*

  API Surface
  Exchanges a federated identity token (facebook, google) for a Hey Mentor identification token
  The Hey Mentor ID token is used for all subsequent API calls requiring authentication.

  Params:
        fedToken - an authentication token from a supported identity provider (facebook, google)
        authType - the authentication type used ("facebook", "google")
        req - the HTTP request
        res - the HTTP response
  Returns:
        Provides an HTTP response to the client via "res" parameter

*/
exports.getIdToken = function(req, res) {
    Users.find({$or: [{'facebook_id': req.fedId}, {'google_id': req.fedId}]}, function(err, user) {
        if (err) {
            console.log('Error getting the user');
            console.log(err);
            return res.send(err);
        } else if (user && user.length > 0) {
            console.log('Got the user - get_id_token');
            return sendIdTokenResult(user, req.params.fedToken, req.params.authType, res);
        } else {
            console.log('No matching user');
            return res.send('No user');
        }
    });
};

exports.getProfileDataUnsecure = function(req, res) {
};
