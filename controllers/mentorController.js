'use strict';

const mongoose = require('mongoose');

const Users = mongoose.model('Users');
mongoose.set('debug', true);

const SUPPORTED_AUTH_TYPES = ['facebook', 'google'];
const FACEBOOK_APP_ID = '1650628351692070';
const GOOGLE_APP_ID = '12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com';
const axios = require('axios');

/*

 Helper Function
 Used to validate a federated facebook token

 Params:
    token - the token to authenticate

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
function validateFacebookToken(token) {
    console.log('validateFacebookToken');

    const fbTokenValidationRequest = `https://graph.facebook.com/me?access_token=${token}`;

    const responseData = axios.get(fbTokenValidationRequest)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
                return Promise.reject(new Error(error.response.data.error.message));
            }
            return Promise.reject(new Error('Something went wrong during the call to the Facebook token validation endpoint'));
        });

    return responseData.then((data) => {
        if (!data) {
            return Promise.reject(new Error('No data returned from auth request to Facebook'));
        }

        // TODO: Facebook doesn't provide an 'aud' claim in the access token to validate
        //  that the user's access token is intended for our app (as opposed to any other Facebook token).
        // To check, we will look up the user in the database to see if the access token belongs to a known
        //  Hey Mentor user.
        // This is a round trip to the DB that will very likely be repeated. Consider optimizations.
        const isKnownUser = getProfileFromFedId(data['id']);
        return isKnownUser.then( (user) => {
            console.log('Inside validateFacebookToken');
            console.log(data['id']);
            console.log(user);
            console.log(user[0].user_id);
            if (user[0].user_id) {
                return data['id'];
            } else {
                return Promise.reject(new Error('Token from Facebook does not contain correct app information, or is invalid'));
            }
        });
    })
        .catch((error) => {
            console.log(error);
            return Promise.reject(new Error('Something went wrong during the call to the Facebook token validation endpoint'));
        });
}

/*

 Helper Function
 Used to validate a federated google token

 Params:
    token - the token to authenticate

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
function validateGoogleToken(token) {
    const googleTokenValidationRequest = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
    const axios = require('axios');

    const responseData = axios.get(googleTokenValidationRequest)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            return Promise.reject(new Error('Something went wrong during the call to the Google token validation endpoint'));
        });

    return responseData.then((data) => {
        if (!data) {
            return Promise.reject(new Error('No data returned from auth request to Google'));
        }

        const appId = data['aud'];
        const correctApp = appId == GOOGLE_APP_ID;

        if (correctApp) {
            return data['user_id'];
        } else {
            return Promise.reject(new Error('Token from Google does not contain correct app information, or is invalid'));
        }
    })
        .catch((error) => {
            console.log(error);
            return Promise.reject(new Error('Something went wrong during the call to the Google token validation endpoint'));
        });
}

/*

 Helper Function
 Used to validate a federated token of the supplied type

 Params:
    token - the token to authenticate
    authType - the authentication that was used to get the token (facebook, google, etc.)

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
function getAuthDataFromIdp(token, authType) {
    console.log('getAuthDataFromIdp');

    switch (authType) {
    case 'facebook':
        return validateFacebookToken(token);
    case 'google':
        return validateGoogleToken(token);
    }
}

/*

 Helper Function
 Called by all secured APIs to validate that the supplied federated token is valid

 Params:
    token - the token to authenticate
    authType - the authentication that was used to get the token (facebook, google, etc.)

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
function validateFederatedToken(token, authType) {
    console.log('validateFederatedToken');

    if (!token || !authType) {
        return Promise.reject(new Error('AuthType and Token are required to validate token'));
    }

    if (!(SUPPORTED_AUTH_TYPES.includes(authType))) {
        return Promise.reject(new Error('AuthType must be in the supported list of auth types'));
    }

    const userData = getAuthDataFromIdp(token, authType);

    return userData.then((data) => {
        console.log('Data');
        console.log(data);
        return data;
    }).catch((error) => {
        console.log(error);
        return Promise.reject(new Error('Generic error'));
    });
}

function validateIdentityToken(token) {
    if (!token) {
        return Promise.reject(new Error('No valid token found'));
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    console.log('Decoded token');
    console.log(decoded);

    if (!decoded || !decoded.fedToken) {
        return Promise.reject(new Error('No valid token found'));
    }

    // TODO: Consider validating that the ID in the federated token matches the same user specified by the user_id in the ID token
    return validateFederatedToken(decoded.fedToken, decoded.authType);
}

function getProfileFromFedId(fedId) {
    return Users.find( {$or: [{'facebook_id': fedId}, {'google_id': fedId}]}, function(err, user) {
        if (err) {
            console.log('Error getting the user');
            console.log(err);
            return null;
        } else if (user && user.length > 0) {
            console.log('Got the user - getProfileFromFedId');
            return user;
        } else {
            console.log('No matching user');
            return null;
        }
    });
}

function getProfileFromUserId(userId) {
    return Users.find( {'user_id': userId}, function(err, user) {
        if (err) {
            console.log('Error getting the user');
            console.log(err);
            return null;
        } else if (user && user.length > 0) {
            console.log('Got the user - getProfileFromUserId');
            return user;
        } else {
            console.log('No matching user');
            return null;
        }
    });
}

function getSendBirdUser(userId) {
    // We will use the Hey Mentor user ID as the SendBird user ID
    // Check if the user was already created in SendBird, otherwise, create it
    return checkSendBirdUserExists(userId).then( (exists) => {
        if (exists) {
            return userId;
        } else {
            createSendBirdUser(userId, 'Nickname').then( (created) => {
                if (created) {
                    return userId;
                } else {
                    console.log('Something went wrong when trying to get the SendBird user');
                    return null;
                }
            });
        }
    });
    /* getProfileFromUserId(userId).then( user => {
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

    return Promise.all([user1_final, user2_final]).then( (values) => {
        const users = [values[0], values[1]];
        console.log('users:');
        console.log(users);

        const channel_data = createSendBirdChannel(users);
        return channel_data.then( (data) => {
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
    validateIdentityToken(req.params.token).then( (fedId) => {
        if ( fedId ) {
            const user1_req = getProfileFromFedId(fedId);
            user1_req.then( (user1) => {
                if ( user1 ) {
                    const user2_req = getProfileFromUserId(req.params.userId);
                    user2_req.then( (user2) => {
                        if ( user2 ) {
                            if ( user1[0].contacts.includes(user2[0].user_id)) {
                                sendProfileDataResult(user2, res);
                            }
                        }
                    });
                }
            });
        } else {
            console.log('Invalid token presented to get_profile_data');
            res.send('You must make a request with a valid access token');
        }
    }).catch( (error) => {
        console.log(error);
        return res.send('Error');
    });
};

exports.getMyProfileData = function(req, res) {
    validateIdentityToken(req.params.token).then( (fedId) => {
        if ( fedId ) {
            const data = getProfileFromFedId(fedId);
            data.then( (data) => {
                console.log('About to send user data back');
                sendProfileDataResult(data, res);
            });
        } else {
            console.log('Invalid token presented to get_profile_data');
            res.send('You must make a request with a valid access token');
        }
    }).catch( (error) => {
        console.log(error);
        return res.send('Error');
    });
};

exports.getMessages = function(req, res) {
    // Params: token, userId
    validateIdentityToken(req.params.token).then( (fedId) => {
        if ( fedId ) {
            const user1_req = getProfileFromFedId(fedId);
            user1_req.then( (user1) => {
                if ( user1 ) {
                    const user2_req = getProfileFromUserId(req.params.userId);
                    user2_req.then( (user2) => {
                        if ( user2 ) {
                            if ( user1[0].contacts.includes(user2[0].user_id)) {
                                const channel = getSendbirdChannel(user1, user2);
                                channel.then( (channel_url) => {
                                    sendChannelDataResult(channel_url, res);
                                });
                            }
                        }
                    });
                }
            });
        } else {
            console.log('Invalid token presented to get_profile_data');
            res.send('You must make a request with a valid access token');
        }
    }).catch( (error) => {
        console.log(error);
        return res.send('Error');
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
    console.log('Get ID Token');
    validateFederatedToken(req.params.fedToken, req.params.authType).then( (valid_user) => {
        if ( valid_user ) {
            Users.find( {$or: [{'facebook_id': valid_user}, {'google_id': valid_user}]}, function(err, user) {
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
        } else {
            console.log('Invalid token presented to get_id_token');
            return res.send('You must make a request with a valid access token');
        }
    }).catch( (error) => {
        console.log(error);
        return res.send('Error');
    });
};

exports.getProfileDataUnsecure = function(req, res) {
};
