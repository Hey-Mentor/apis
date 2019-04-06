require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { logger } = require('./logging/logger');
require('./models/users');

const app = express();
const port = process.env.PORT || 8081;

// mongoose instance connection url connection
mongoose.Promise = require('bluebird');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.DB_URL
    : process.env.TEST_DB_URL;

mongoose.connect(connectionString, { useNewUrlParser: true });

// Handle the connection event
const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error:'));

db.once('open', () => {
    logger.info('DB connection alive');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(require('./routes/routes'));

app.listen(port);

logger.info(`API server started on port: ${port}`);

// For testing purposes
module.exports = app;
