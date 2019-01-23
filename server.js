require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { logger } = require('./logging/logger');

const app = express();
const port = process.env.PORT || 8081;

// mongoose instance connection url connection
mongoose.Promise = require('bluebird');
require('./models/users');

const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.CONNECTION_STRING
    : process.env.TEST_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true });

// Handle the connection event
const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error:'));

db.once('open', () => {
    logger.info('DB connection alive');
    const Admin = mongoose.mongo.Admin;
    new Admin(db.db).listDatabases((err, result) => {
        logger.info('listDatabases succeeded');
        const allDatabases = result.databases;
        logger.info(allDatabases);
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(require('./routes/routes'));

app.listen(port);

logger.info(`API server started on port: ${port}`);
logger.info(`SendBird secret: ${process.env.sendbirdkey}`);
// $env:sendbirdkey="<SECRET>"; node server.js

// For testing purposes
module.exports = app;
