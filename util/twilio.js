const twilio = require('twilio');

exports.TokenGenerator = function (identity) {
    const AccessToken = twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;
    // Create a unique ID for the client on their current device
    const endpointId = `TwilioChat:${identity}`;

    // Create a "grant" which enables a client to use Chat as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
        serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
        endpointId,
    });
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_CHAT_SERVICE_API_KEY,
        process.env.TWILIO_ACCOUNT_API_KEY,
    );
    token.addGrant(chatGrant);
    token.identity = identity;

    return token.toJwt();
};
