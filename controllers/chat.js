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

// exports.createTwilioUser = function (req, res) {
//     if (!req.body.device) {
//         return res.status(400).send('Missing device');
//     }
//     const chat_token = TwilioService.TokenGenerator(req.user._id, 'init');

//     return res.json({
//         _id: req.user._id,
//         chat_token,
//     });
// };
// // Response should have .token and .channel
// const chatClient = new Twilio.Chat.Client(responseJson.token);
