exports.handleError = function (err, res) {
    if (err.code === 11000) {
        res.status(409).json(err);
    } else if (err.name === 'ValidationError') {
        res.status(422).json(err);
    } else {
        res.status(500).json(err);
    }
};
