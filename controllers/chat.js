const Twilio = require('twilio-chat');

const TwilioService = require('../services/twilio');


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



exports.createTwilioChannel = async function (req, res) {
    //Require body to contain channelname
    if (!req.body.channelName) {
        return res.status(400).send('The body does not contain a channel name');
    }

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
        async inviteToChannel(channel_sid, identity) {
            this.client.chat.services(this.serviceSid)
                .channels(channel_sid)
                .invites
                .create({
                    identity: identity
                })
                .then(function (invite) {
                    console.log("Invited user: " + invite.sid + " to channel: " + channel_sid);
                }).catch(() => {
                    console.log("Failed to invite user: " + identity + " to channel: " + channel_sid);
                });
        }

        //code for fetching messages from channel
        async fetchMessages(channel_sid) {
            this.client.chat.services(this.serviceSid)
                .channels(channel_sid)
                .messages
                .list({
                    limit: 20
                })
                .then(function (message) {
                    var incomingMessage= [];

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

                        console.log("Message in channel: " + m.body)
                        
                    });

                    return res.status(200).json(
                        incomingMessage
                    );
                    //m.to = channel sid
                    //m.sid = message resaurce id.

                });
        }

        //code for creating channels
        async createChannel() {
            const newChannel = await this.client.chat.services(this.serviceSid)
                .channels
                .create({
                    uniqueName: req.body.channelName,
                    friendlyName: req.body.channelName,
                })
                .catch((error) => {
                    //e.message says why the channel creation failed.
                    console.log('Failed to create channel. ' + error.message + ". Error: " + error.code);

                    //Catch channel already exists
                    if (error.code === 50307) {
                        //TODO: Try to send invite to both users
                        console.log("Inviting users to existing channel: " + req.body.channelName);
                        this.checkChannelInviteRequirements();
                    }

                    //Returning 5xx error
                    return res.status(501).json({
                        status: 'Failed to create channel. ' + error.message + ". Error: " + error.code
                    });
                });

            //The channel was created
            if (newChannel) {
                //send invites
                this.checkChannelInviteRequirements()
                return res.status(201).json({
                    status: 'Twilio channel created'
                });
            }
        }
        async checkChannelInviteRequirements() {
            if (!req.body.inviteList) {
                //return res.status(400).send('The body does not contain a channel name');]
                console.log("No inviteList was in the request body. Not sending any invites. ");
            }
            //If there are any users in the body of the post request
            if (req.body.inviteList) {
                var i;
                for (i = 0; i < req.body.inviteList.length; i++) {
                    this.inviteToChannel(req.body.channelName, req.body.inviteList[i]);
                }
            }
        }
    }


    //updateChannelData();
    //deleteChannel('CH0534d4a8a5384aa9a0e204d892c27b8a');

    test = new Channel();
    //test.updateChannelData('CHc71753c96f8545d6a99d0e054cc48485');
    //test.inviteToChannel('CH8a8d7a942f594416a080ccbb7a809e74', '5c15446bbf35ae4057111111');
    //test.inviteToChannel('CH8a8d7a942f594416a080ccbb7a809e74', '5c15446bbf35ae4057222222');

    //Fetch Messages from a channel
    test.fetchMessages('CHe157a4c4649646ccb528160bd417d43b');

    // try {
    //     return test.createChannel();
    // } catch (err) {
    //     return res.sendStatus(500);
    // }


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