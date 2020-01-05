
const Twilio = require('twilio-chat');

const TwilioService = require('../services/twilio');
const UserValidation = require('../services/userValidation');

exports.createToken = function (req, res) {
    if (!req.body.device) {
        return res.status(400).send('Missing device');
    }
    const chat_token = TwilioService.TokenGenerator(req.user._id, req.body.device);

    return res.json({
        _id: req.user._id,
        chat_token,
    });
};

exports.createChatChannel = async function (req, res) {
    const allValid = req.body.user_ids.array.forEach(
        element => UserValidation.ValidateChatUser(element, true),
    );

    if (!allValid) {
        return res.sendStatus(400);
    }

    // TODO: Check if each user already has a channel created, and skip if needed

    return res.sendStatus(500);
};

exports.createChatUser = async function (req, res) {
    if (!UserValidation.ValidateChatUser(req.body.user_id, false)) {
        return res.sendStatus(400);
    }

    try {
        const client = await Twilio.Client.create(TwilioService.TokenGenerator(req.user._id, 'init'));
        if (!client) {
            return res.sendStatus(500);
        }

        UserValidation.InitChatUser(req.body.user_id);
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
};
