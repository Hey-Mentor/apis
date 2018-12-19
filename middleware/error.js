const {logger} = require('../logging/logger');

exports.error = function(err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
}
;
