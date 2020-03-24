/* eslint-disable new-cap */
const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const client = process.env.NODE_ENV === 'production'
    ? new twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
    )
    : new twilio(
        process.env.TEST_TWILIO_ACCOUNT_SID,
        process.env.TEST_TWILIO_AUTH_TOKEN,
    );

const Helpers = require('./helpers');
const { logger } = require('../logging/logger');

exports.TokenGenerator = function (identity, deviceID) {
    // Create a unique ID for the client on their current device
    const endpointId = `TwilioChat:${identity}:${deviceID}`;

    // Create a "grant" which enables a client to use Chat as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
        serviceSid:
      process.env.NODE_ENV === 'production'
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

const addMemberToChannel = async function (channelId, userId) {
    return client.chat
        .services(
            process.env.NODE_ENV === 'production'
                ? process.env.TWILIO_CHAT_SERVICE_SID
                : process.env.TEST_TWILIO_CHAT_SERVICE_SID,
        )
        .channels(channelId)
        .members.create({ identity: userId })
        .catch((error) => {
            logger.error(error.toString());
            return false;
        })
        .then(member => member);
};

exports.createChannel = async function (userIds) {
    const channelUniqueName = Helpers.getUniqueStringName(32);
    const channelFriendlyName = Helpers.getUniqueStringName(16);

    const newChannel = await client.chat
        .services(
            process.env.NODE_ENV === 'production'
                ? process.env.TWILIO_CHAT_SERVICE_SID
                : process.env.TEST_TWILIO_CHAT_SERVICE_SID,
        )
        .channels.create({
            uniqueName: channelUniqueName,
            friendlyName: channelFriendlyName,
        })
        .catch((error) => {
            logger.error(`Failed to create channel. ${error.message}. Error: ${error.code}`);
            return null;
        });

    if (newChannel) {
        userIds.map(async (user) => {
            await addMemberToChannel(newChannel.sid, user);
        });
        return newChannel;
    }

    return null;
};
