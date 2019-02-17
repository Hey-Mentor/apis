const TwilioUtil = require('../util/twilio');

exports.createToken = function (req, res) {
    const token = TwilioUtil.TokenGenerator(req.user._id, req.body.device);

    res.json({
        _id: req.user._id,
        token,
    });
};
