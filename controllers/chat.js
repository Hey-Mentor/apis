const Twilio = require('twilio-chat');

const TwilioService = require('../services/twilio');

class Channel {
    constructor() {
        // Creating public variables
        this.accountSid = process.env.TEST_TWILIO_ACCOUNT_SID;
        this.serviceSid = process.env.TEST_TWILIO_CHAT_SERVICE_SID;
        this.authToken = process.env.TEST_TWILIO_AUTH_TOKEN;

        // eslint-disable-next-line global-require
        this.client = require('twilio')(this.accountSid, this.authToken);
        // eslint-disable-next-line global-require
        this.user = require('mongoose').model('User');
        // eslint-disable-next-line global-require
        this.request = require('request');
        // eslint-disable-next-line global-require
        this.cheerio = require('cheerio');
    }


    async fetchChannel(channel_sid) {
        return this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .fetch()
            .then(channel => channel);
    }


    // code for updating channel info
    async updateChannelData(channel_sid) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .update({
                friendlyName: 'Chatroom',
            })
            .then(() => {
                // console.log('Successfully changed the friendly channel name to: '
                // , channel.friendlyName);
            });
    }


    // code for deleting channels
    async deleteChannel(channel_sid) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .remove()
            .then(() => {
                // console.log('Deleted channel: ' + channel_sid);
            });
    }


    //  code for inviting to channels
    async inviteToChannel(channel_sid, user) {
        this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .invites
            .create({
                identity: user,
            })
            .then((invite) => {
                console.log(`Invited user: ${invite.sid} to channel: ${channel_sid}`);
                return true;
            })
            .catch((er) => {
                // User already invited - Error code: 50212
                if (er.code === 50212) {
                    console.log(`Failed to invite "${user}" to channel "${channel_sid}" ${er} - ${er.code}`);
                    return true;
                }
                console.log(`Failed to invite "${user}" to channel "${channel_sid}" ${er} - ${er.code}`);
                return false;
            });
    }

    //  code for adding to channels
    async addToChannel(channel_sid, user) {
        const addUser = await this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .members
            .create({ identity: user })
            .then((member) => {
                console.log(`Added user: ${member.sid} to channel: ${channel_sid}`);
                return true;
            })
            .catch((er) => {
                console.log(`Failed to add "${user}" to channel "${channel_sid}" ${er} - ${er.code}`);
                return false;
            });

        return addUser;
    }


    // code for creating channels
    async createChannel(req, res) {
        await this.client.chat.services(this.serviceSid)
            .channels
            .create({
                uniqueName: req.body.channelName,
                friendlyName: req.body.channelName,
            })
            .then(async (çreatedChannel) => {
                // Send invites
                await this.checkChannelInviteRequirements(req.body.channelName, req.body.inviteList);
                return res.status(201).json({
                    channel: çreatedChannel,
                    status: 'Twilio channel created',
                });
            })
            .catch(async (error) => {
                console.log(`Failed to create channel. ${error.message}. Error: ${error.code}`);
                // Catch channel already exists
                if (error.code === 50307) {
                    // TODO: Try to send invite to both users
                    console.log(`Inviting users to existing channel: ${req.body.channelName}  :${req.body.inviteList}`);
                    await this.checkChannelInviteRequirements(req.body.channelName, req.body.inviteList);
                }
                // Returning 5xx error
                return res.status(501).json({
                    status: `Failed to create channel. ${error.message}. Error: ${error.code}`,
                });
            });
    }


    async checkChannelInviteRequirements(channelName, inviteList) {
        if (!inviteList) {
            // return res.status(400).send('The body does not contain a channel name');]
            console.log('No invitations were sent. ');
        }
        // If there are any users in the body of the post request
        if (inviteList) {
            inviteList.forEach((element) => {
                // Check if user exist
                this.user.findOne({
                    _id: element,
                })
                    .orFail(new Error())
                    .then(async () => {
                        new Channel().addToChannel(channelName, element);
                    }).catch((er) => {
                        console.log(`The user ${element} was not found in the database. Error: ${er.message}`);
                        return false;
                    });
            });
        }
    }

    async linkFinder(channel_sid) {
        return this.client.chat.services(this.serviceSid)
            .channels(channel_sid)
            .messages
            .list({
                limit: 20,
            })
            .then(async (message) => {
                var request = require('request');
                var cheerio = require('cheerio');

                function getHtmlBody(url) {
                    return new Promise(((resolve, reject) => {
                        request(url, (error, res, body) => {
                            if (!error && res.statusCode == 200) {
                                resolve(body);
                            } else {
                                reject(error);
                            }
                        });
                    }));
                }
                const incomingMessage = [];

                // Looping through each message
                const done = await message.map(async (m) => {
                    const regexLink = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g);


                    try {
                        // Looping through all links
                        const links = (m.body).match(regexLink)
                            .map(async (url) => {
                                // Add http:// to every link
                                if (!url.match(/^https?:\/\//i)) {
                                    url = `http://${url}`;
                                }


                                incomingMessage.push({
                                    url: url,
                                    sender: m.from,
                                    channel: m.to,
                                    dateSent: m.dateCreated,
                                    dateUpdated: m.dateUpdated,
                                    media: m.media,
                                });
                            });
                    } catch (er) {
                        // U
                    }
                });

                if (done) {
                    console.log('done');
                    return incomingMessage;
                }
            });
    }


    async linkScraper(url) {

        var request = require('request');
        var cheerio = require('cheerio');

        function getHtmlBody(url) {
            return new Promise(((resolve, reject) => {
                request(url, (error, res, body) => {
                    if (!error && res.statusCode == 200) {
                        console.log('boooooooooooooooooooooody', body);
                        resolve(body);
                    } else {
                        reject(error);
                    }
                });
            }));
        }
        const incomingMessage = [];

        try {
            // Add http:// to link
            if (!url.match(/^https?:\/\//i)) {
                url = `http://${url}`;
            }

            const html = await getHtmlBody(url);

            let title = null;
            if (html) {
                const $ = cheerio.load(html);
                title = $('head > title').text();
                let icon = `${url}/favicon.ico`
                icon = `${url}${$('link').attr('href')}`; // ""//$('link[rel='']');
                console.log('title: ', icon);
                
                incomingMessage.push({
                    url,
                    title,
                    icon,
                });
                return incomingMessage;
            }

        } catch (er) {
            // U
        }
    }
}

exports.getLinks = async function (req, res) {
    if (!req.body.channelSid) {
        return res.status(400).send('Missing channelSid');
    }

    const links = await new Channel().linkFinder(req.body.channelSid);

    if (links) {
        console.log(links);
        return res.json(
            { links },
        );
    }

    return res.json({
        status: 'Failed to fetch links from channel',
    });
};

exports.getLinkInfo = async function (req, res) {
    if (!req.body.url) {
        return res.status(400).send('Missing channelSid');
    }

    const linkInformation = await new Channel().linkScraper(req.body.url);

    if (linkInformation) {
        return res.json({
            linkInformation,
        });
    }

    return res.json({
        status: 'Failed to fetch links from channel',
    });
};


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

exports.createTwilioUser = async function (req, res) {
    const chat_token = TwilioService.TokenGenerator(req.user._id, 'init');

    try {
        // Init twilio client
        const client = await Twilio.Client.create(chat_token);
        if (!client) {
            return res.sendStatus(500);
        }
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.status(201).json({ status: 'Twilio user created' });
};
