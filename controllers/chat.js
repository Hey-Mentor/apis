const Twilio = require('twilio-chat');

const TwilioService = require('../services/twilio');


class Channel {
    constructor() {
        //Creating public 
        this.accountSid = process.env.TEST_TWILIO_ACCOUNT_SID;
        this.serviceSid = process.env.TEST_TWILIO_CHAT_SERVICE_SID;
        this.authToken = process.env.TEST_TWILIO_AUTH_TOKEN;
        this.client = require('twilio')(this.accountSid, this.authToken);
    }





    //code for updating channel info
    async updateChannelData(channel_sid) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .update({
                'friendlyName': 'Chatroom'
            })
            .then(channel => console.log("Successfully changed the friendly channel name to: " + channel.friendlyName));
    }





    //code for deleting channels
    async deleteChannel(channel_sid) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .remove()
            .then(function (channel) {
                console.log("Deleted channel: " + channel_sid);
            });
    }





    //code for inviting to channels
    async inviteToChannel(channel_sid, user) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .invites
            .create({
                identity: user
            })
            .then(function (invite) {
                console.log("Invited user: " + invite.sid + " to channel: " + channel_sid);
                return true;
            })
            .catch((er) => {
                //User already invited - Error code: 50212
                if (er.code === 50212) {
                    console.log('Failed to invite "' + user + '" to channel "' + channel_sid + '" ' + er + ' - ' + er.code);
                    return true;
                }
                console.log('Failed to invite "' + user + '" to channel "' + channel_sid + '" ' + er + ' - ' + er.code);
                return false;
            });
    }





    //code for fetching messages from channel
    async fetchMessagesTemp(channel_sid) {
        var ta = await this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .messages
            .list({
                limit: 20
            })

            .then(function (message) {
                var incomingMessage = [];
                message.forEach(m => {
                    incomingMessage.push({
                        _id: m.to,
                        text: m.body,
                        createdAt: m.dateCreated,
                        user: {
                            //sender
                            _id: m.from,
                            name: m.from,
                            avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmXGGuS_PrRhQt73sGzdZvnkQrPXvtA-9cjcPxJLhLo8rW-sVA',
                        },
                    });
                    console.log("Message in channel: " + message);
                });
                return message;
            })
            .then((message) => {
                return message;
            });
        return ta;
    }





    //code for creating channels
    async createChannel(req, res) {
        const newChannel = await this.client.chat.services(this.serviceSid)
            .channels
            .create({
                uniqueName: req.body.channelName,
                friendlyName: req.body.channelName,
            })
            .then(() => {
                //send invites
                this.checkChannelInviteRequirements(req.body.channelName, req.body.inviteList);
                return res.status(201).json({
                    status: 'Twilio channel created'
                });
            })
            .catch(async (error) => {
                console.log('Failed to create channel. ' + error.message + ". Error: " + error.code);
                //Catch channel already exists
                if (error.code === 50307) {
                    //TODO: Try to send invite to both users
                    console.log("Inviting users to existing channel: " + req.body.channelName + "  :" + req.body.inviteList);
                    await this.checkChannelInviteRequirements(req.body.channelName, req.body.inviteList);
                }
                //Returning 5xx error
                return res.status(501).json({
                    status: 'Failed to create channel. ' + error.message + ". Error: " + error.code
                });
            });
    }




    async checkChannelInviteRequirements(channelName, inviteList) {
        if (!inviteList) {
            //return res.status(400).send('The body does not contain a channel name');]
            console.log("No invitations were sent. ");
        }
        //If there are any users in the body of the post request
        if (inviteList) {
            var i;
            const mongoose = require('mongoose');
            const User = mongoose.model('User');
            inviteList.forEach(element => {
                //Check if user exist
                User.findOne({
                        _id: element,
                    })
                    .orFail(new Error())
                    .then(async function () {
                        test = new Channel();
                        await test.inviteToChannel(channelName, element);
                    }).catch((er) => {
                        console.log('The user ' + element + ' was not found in the database. Error: ' + er.message);
                        return false;
                    });
            });
        }
    }
}





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

exports.fetchMessages = async function (req, res) {
    test = new Channel();
    const messages = await test.fetchMessagesTemp('CHe157a4c4649646ccb528160bd417d43b');


    if (messages) {
        return res.status(400).send(messages);
    }
};



exports.createTwilioChannel = async function (req, res) {
    //Require body to contain channelname
    if (!req.body.channelName) {
        return res.status(400).send('The body does not contain a channel name');
    }

    test = new Channel();
    //test.deleteChannel('CHff026731988947f8a8b2646831ef376d');
    //test.updateChannelData('CHc71753c96f8545d6a99d0e054cc48485');
    //test.inviteToChannel('CH8a8d7a942f594416a080ccbb7a809e74', '5c15446bbf35ae4057111111');
    //test.inviteToChannel('CH8a8d7a942f594416a080ccbb7a809e74', '5c15446bbf35ae4057222222');
    //test.fetchMessagesTemp('CHe157a4c4649646ccb528160bd417d43b');
    //return res.sendStatus(200);

    try {
        channel = await test.createChannel(req, res);
        if (channel) {
            return; //res.sendStatus(200);
        }
    } catch (err) {
        return; //res.sendStatus(500);
    }
}


exports.createTwilioUser = async function (req, res) {
    const chat_token = TwilioService.TokenGenerator(req.user._id, 'init');

    try {
        // Init twilio client
        const client = await Twilio.Client.create(chat_token);
        if (!client) {
            return res.sendStatus(500);
        }
        this.client.getPublicChannelDescriptors().then((paginator) => {
            for (i = 0; i < paginator.items.length; i++) {
                const channel = paginator.items[i];
                if (channel.friendlyName === channelName) {
                    console.log("-Channel already exist");
                    return channel.getChannel();
                }
            }
        });
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.status(201).json({
        status: 'Twilio user created'
    });
};