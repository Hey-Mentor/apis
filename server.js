const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {logger} = require('./logging/logger');
const app = express();
const port = process.env.PORT || 8081;

mongoose.set('debug', true);

// mongoose instance connection url connection
mongoose.Promise = require('bluebird');
require('./models/users');

var connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, { useNewUrlParser: true });

// Handle the connection event
const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error:'));

db.once('open', function() {
    logger.log('info', 'DB connection alive');
    const Admin = mongoose.mongo.Admin;
    new Admin(db.db).listDatabases(function(err, result) {
        logger.log('info', 'listDatabases succeeded');
        const allDatabases = result.databases;
        logger.log('info', allDatabases);
    });
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const routes = require('./routes/routes'); // importing route
routes(app); // register the route

app.listen(port);

logger.log('info', 'API server started on port: ' + port);
logger.log('info', 'SendBird secret: ' + process.env.sendbirdkey);
// $env:sendbirdkey="<SECRET>"; node server.js
