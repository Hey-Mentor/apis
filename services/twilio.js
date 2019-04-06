const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

exports.TokenGenerator = function (identity, deviceID) {
    // Create a unique ID for the client on their current device
    const endpointId = `TwilioChat:${identity}:${deviceID}`;

    // Create a "grant" which enables a client to use Chat as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
        serviceSid: process.env.NODE_ENV === 'production'
            ? process.env.TWILIO_CHAT_SERVICE_SID
            : process.env.TEST_TWILIO_CHAT_SERVICE_SID,
        endpointId,
    });
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = process.env.NODE_ENV === 'production'
        ? new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
        )
        : new AccessToken(
            process.env.TEST_TWILIO_ACCOUNT_SID,
            process.env.TEST_TWILIO_API_KEY,
            process.env.TEST_TWILIO_API_SECRET,
        );
    token.addGrant(chatGrant);
    token.identity = String(identity);

    return token.toJwt();
};
