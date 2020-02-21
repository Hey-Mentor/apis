const accountSid = process.env.NODE_ENV === 'production'
    ? process.env.TWILIO_ACCOUNT_SID
    : process.env.TEST_TWILIO_ACCOUNT_SID;
const authToken = process.env.NODE_ENV === 'production'
    ? process.env.TWILIO_AUTH_TOKEN
    : process.env.TEST_TWILIO_AUTH_TOKEN;
const servicesId = process.env.NODE_ENV === 'production'
    ? process.env.TWILIO_CHAT_SERVICE_SID
    : process.env.TEST_TWILIO_CHAT_SERVICE_SID;

const client = require('twilio')(accountSid, authToken);
const Twilio = require('twilio-chat');

const Helpers = require('../services/helpers');
const TwilioService = require('../services/twilio');
const UserValidation = require('../services/userValidation');
const { logger } = require('../logging/logger');


exports.createToken = function (req, res) {
    if (!req.body.device) {
        return res.status(400).send('Missing device');
    }
    const chat_token = TwilioService.TokenGenerator(
        req.user._id,
        req.body.device,
    );

    return res.json({
        _id: req.user._id,
        chat_token,
    });
};

exports.createChatChannel = async function (req, res) {
    const userIds = req.body.user_ids.array;
    const allValid = userIds.forEach(element => UserValidation.ValidateChatUser(element, true));

    if (!allValid) {
        return res.sendStatus(400);
    }

    // TODO: Check if each user already has a channel created, and skip if needed

    // TODO: Create the actual channel in Twilio
    // (Fredrik's code has this, but I took it out to move
    //   away from the class-based approach)

    // TODO: Add the appropriate members to the channel

    const channelUniqueName = Helpers.getUniqueStringName(32);
    const channelFriendlyName = Helpers.getUniqueStringName(16);

    const newChannel = await client.chat
        .services(servicesId)
        .channels.create({
            uniqueName: channelUniqueName,
            friendlyName: channelFriendlyName,
        })
        .catch((error) => {
            // Catch channel already exists
            if (error.code === 50307) {
                // TODO: Try to send invite to all users if needed
            }

            // Returning 5xx error
            return res.status(501).json({
                status: `Failed to create channel. ${error.message}. Error: ${error.code}`,
            });
        });

    if (newChannel) {
        userIds.map(async (item) => {
            await this.addMemberToChannel(newChannel.sid, item);
        });
        return res.status(201).json({ status: 'Twilio channel created' });
    }

    return res.sendStatus(500).json({
        status: 'Failed to create channel.',
    });
};

exports.addMemberToChannel = async function (channelSId, userId) {
    return client.chat.services(servicesId)
        .channels(channelSId)
        .members
        .create({ identity: userId })
        .catch((error) => {
            logger.error(error.toString());
            return false;
        }).then(member => member);
};

exports.createChatUser = async function (req, res) {
    if (!UserValidation.ValidateChatUser(req.body.user_id, false)) {
        return res.sendStatus(400);
    }

    try {
        const twilioClient = await Twilio.Client.create(
            TwilioService.TokenGenerator(req.user._id, 'init'),
        );
        if (!twilioClient) {
            return res.sendStatus(500);
        }

        UserValidation.InitChatUser(req.body.user_id);
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
};
