const ERR_DUPLICATE_KEY = 11000;

exports.handleMongooseError = function (err, res) {
    if (err.code === ERR_DUPLICATE_KEY) {
        res.status(409).json(err);
    } else if (err.name === 'ValidationError') {
        res.status(422).json(err);
    } else {
        res.status(500).json(err);
    }
};
