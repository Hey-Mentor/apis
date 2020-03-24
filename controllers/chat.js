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
            const updates = userIds.map(
                user => ({ $push: { contacts: { user_id: user, channel_id: channel.sid } } }),
            );
            userIds.map(
                user_id => updates.filter(id => id !== user_id).forEach(
                    update => User.updateOne({ id: user_id }, update),
                ),
            );
            return res.sendStatus(201);
        }
        return res.sendStatus(200);
    } catch (err) {
        return res.sendStatus(500);
    }
};

exports.createChatUser = async function (req, res) {
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
