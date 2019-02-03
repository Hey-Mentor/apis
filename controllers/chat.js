const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_API_KEY);
const mongoose = require('mongoose');

const { logger } = require('../logging/logger');

const Users = mongoose.model('User');

exports.createChat = async function (req, res) {
    if (!req.body || !req.body.users) {
        return res.status(400).end();
    }
    // Ensure all users are in current users contact list
    const valid_users = req.body.users.reduce(
        (acc, user) => req.user.contacts.indexOf(user) >= 0 && acc, true,
    );

    if (!valid_users) {
        return res.status(400).end();
    }
    const channel_id = await client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
        .channels
        .create()
        .then(channel => channel.sid)
        .done();

    const all_channel_users = req.body.users.concat([req.user._id]);

    await Promise.all(all_channel_users.map(user => client.chat
        .services(process.env.TWILIO_CHAT_SERVICE_SID)
        .channels(channel_id)
        .members.create({ identity: user })
        .done()));

    const channel = {
        channel_id,
        users: all_channel_users,
    };

    return Users.updateMany({ _id: { $in: all_channel_users } }, { $push: { channels: channel } })
        .then(() => res.status(201).json({ channel }))
        .catch((err) => {
            logger.error(err);
            return res.status(500).end();
        });
};
