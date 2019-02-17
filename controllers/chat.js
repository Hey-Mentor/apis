const TwilioService = require('../services/twilio');

exports.createToken = function (req, res) {
    const token = TwilioService.TokenGenerator(req.user._id, req.body.device);

    res.json({
        _id: req.user._id,
        token,
    });
};
