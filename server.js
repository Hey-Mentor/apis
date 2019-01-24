require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { logger } = require('./logging/logger');
require('./models/users');

const app = express();
const port = process.env.PORT || 8081;

// mongoose instance connection url connection
mongoose.Promise = require('bluebird');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.CONNECTION_STRING
    : process.env.TEST_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true });

// Handle the connection event
const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error:'));

db.once('open', () => {
    logger.info('DB connection alive');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(require('./routes/routes'));

app.listen(port);

logger.info(`API server started on port: ${port}`);

// For testing purposes
module.exports = app;
