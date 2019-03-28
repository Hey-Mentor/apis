const TwilioService = require('../services/twilio');
const { logger } = require('../logging/logger');

exports.createToken = function (req, res) {
    logger.info('Creating Twilio token for request');
    logger.info('Request body:');
    logger.info(JSON.stringify(req.body));

    if (!req.body.device) {
        logger.error('Missing device');

        return res.status(400).send('Missing device');
    }
    const chat_token = TwilioService.TokenGenerator(req.user._id, req.body.device);

    return res.json({
        _id: req.user._id,
        chat_token,
    });
};
