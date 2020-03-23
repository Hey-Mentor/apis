
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
    const userIds = req.body.user_ids.array;
    const allValid = userIds.forEach(element => UserValidation.ValidateChatUser(element, true));

    if (!allValid) {
        return res.sendStatus(400);
    }
    try {
        const channel = TwilioService.createChannel(userIds);
        const update = { channel_id: channel.sid };
        userIds.map(user_id => User.updateOne({ id: user_id, channel_id: 'test' }, update));
        if (channel) {
            return res.sendStatus(201);
        }
        return res.sendStatus(500);
    } catch (err) {
        return res.sendStatus(500);
    }

    // TODO: Check if each user already has a channel created, and skip if needed

    // TODO: Create the actual channel in Twilio
    // (Fredrik's code has this, but I took it out to move
    //   away from the class-based approach)

    // TODO: Add the appropriate members to the channel
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
