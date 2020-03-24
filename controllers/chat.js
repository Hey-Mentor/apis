/* eslint-disable no-unused-vars */

const mongoose = require('mongoose');
const Twilio = require('twilio-chat');

const TwilioService = require('../services/twilio');
const UserValidation = require('../services/userValidation');

const User = mongoose.model('User');
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
    if (!req.body.user_ids) {
        return res.sendStatus(400);
    }
    const userIds = req.body.user_ids;
    const allValid = userIds.every(UserValidation.UserHasTwilioContext);

    if (!allValid) {
        // Some of the users that are being added to a new channel do not have
        // twilio context created for them.
        // TODO: Return an error letting the caller know they need to create the twilio
        // user for each user in this request.
        return res.sendStatus(400);
    }
    try {
        // TODO: Check if each user already has a channel created. If any user
        // already has a channel, consider not creating a new one, and failing this op.
        const channel = TwilioService.createChannel(userIds);
        if (channel) {
            const update = { channel_id: channel.sid };
            userIds.map(user_id => User.updateOne({ id: user_id }, update));
            return res.sendStatus(201);
        }
        return res.sendStatus(200);
    } catch (err) {
        return res.sendStatus(500);
    }
};

exports.createChatUser = async function (req, res) {
    const userAlreadyInitialized = await UserValidation.UserHasTwilioContext(req.body.user_id);
    if (userAlreadyInitialized) {
        // TODO: We probably don't need this check, and in order to support
        // multi-device login, we will probably need this check to not be here.
        // Ensure that it's safe to create an existing user. Twilio creation
        // should be idempotent.
        return res.sendStatus(409);
    }

    try {
        // TODO: Update the device key to allow multi-device login
        const twilioClient = await Twilio.Client.create(
            TwilioService.TokenGenerator(req.user._id, 'init'),
        );
        if (!twilioClient) {
            return res.sendStatus(500);
        }

        await UserValidation.MarkUserInitialized(req.body.user_id);
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
};
