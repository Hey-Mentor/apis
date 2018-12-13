const axios = require('axios');
const profile = require('../util/profile');
const {logger} = require('../logging/logger');

const SUPPORTED_AUTH_TYPES = ['facebook', 'google'];
const FACEBOOK_APP_ID = '1650628351692070';
const GOOGLE_APP_ID = '12899066904-jqhmi5uhav530aerctj631gltumqvk8i.apps.googleusercontent.com';

/*

 Helper Function
 Used to validate a federated facebook token

 Params:
    token - the token to authenticate

 Returns:
    Promise object, resolves to the user_id from within the provided token, or rejected if the token is invalid

*/
function validateFacebookToken(token) {
    logger.log('info', 'validateFacebookToken');

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
        const isKnownUser = profile.getProfileFromFedId(data['id']);
        return isKnownUser.then((user) => {
            logger.log('info', 'Inside validateFacebookToken');
            logger.log('info', data['id']);
            logger.log('info', user);
            logger.log('info', user[0].user_id);
            if (user[0].user_id) {
                return data['id'];
            } else {
                return Promise.reject(new Error('Token from Facebook does not contain correct app information, or is invalid'));
            }
        });
    })
        .catch((error) => {
            logger.log('info', error);
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
            logger.log('info', error);
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
            logger.log('info', error);
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
    logger.log('info', 'getAuthDataFromIdp');

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
async function validateFederatedToken(token, authType) {
    logger.log('info', 'validateFederatedToken');

    if (!token || !authType) {
        return Promise.reject(new Error('AuthType and Token are required to validate token'));
    }

    if (!(SUPPORTED_AUTH_TYPES.includes(authType))) {
        return Promise.reject(new Error('AuthType must be in the supported list of auth types'));
    }

    try {
        const user_data = await getAuthDataFromIdp(token, authType);
        logger.log('info', 'Data');
        logger.log('info', user_data);
        return user_data;
    } catch (error) {
        logger.log('info', error);
        return Promise.reject(new Error('Generic error'));
    }
}

async function validateIdentityToken(token) {
    if (!token) {
        return Promise.reject(new Error('No valid token found'));
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    logger.log('info', 'Decoded token');
    logger.log('info', decoded);

    if (!decoded || !decoded.fedToken) {
        return Promise.reject(new Error('No valid token found'));
    }

    // TODO: Consider validating that the ID in the federated token matches the same user specified by the user_id in the ID token
    return validateFederatedToken(decoded.fedToken, decoded.authType);
}

exports.authorize = function(req, res, next) {
    if (req.path.includes('token/')) {
        validateFederatedToken(req.query.fedToken, req.params.authType)
            .then((fedId) => {
                req.fedId = fedId;
                next();
            })
            .catch((err) => {
                res.status(401).send('Unauthorized');
            });
    } else {
        validateIdentityToken(req.query.token)
            .then((fedId) => {
                req.fedId = fedId;
                next();
            })
            .catch((err) => {
                res.status(401).send('Unauthorized');
            });
    }
};
