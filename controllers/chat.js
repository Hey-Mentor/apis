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

exports.createTwilioChannel = async function (req, res){
    //Require body to contain channelname
    if (!req.body.channelName) {
        return res.status(400).send('Missing channelName');
    }

    try{
        const chat_token = TwilioService.TokenGenerator(req.user._id, 'init');
        const chatClient = await Twilio.Client
        .create(
            chat_token, 
            { logLevel: 'info' }
        );

        if (!chatClient){
            return res.sendStatus(501);
        }

        const channel = await chatClient
            .createChannel({
                uniqueName: req.body.channelName,
                friendlyName: 'Chat channel',
            }).catch((e) =>{
                //e.message says why the channel creation failed.
                return res.status(506).json({ status: 'Failed to create channel. ' + e.message});
            });
        
        console.log('Created new channel.');

    }catch (err) {
        return res.sendStatus(500);
    }

    return res.status(201).json({ status: 'Twilio channel created'});

}


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
