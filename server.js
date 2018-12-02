const express = require('express');

const app = express();

const port = process.env.PORT || 3002;

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;

// var connectionString = require('./local');
const connectionString = 'mongodb://localhost:27017/HeyMentor';
mongoose.connect(connectionString, {useNewUrlParser: true});

// var connectionString = process.env.CONNECTION_STRING;
// mongoose.connect(connectionString);

// Handle the connection event
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('DB connection alive');
    const Admin = mongoose.mongo.Admin;
    new Admin(db.db).listDatabases(function(err, result) {
        console.log('listDatabases succeeded');
        const allDatabases = result.databases;
        console.log(allDatabases);
    });
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const routes = require('./routes/routes'); // importing route
routes(app); // register the route

app.listen(port);

console.log('API server started on port: ' + port);
console.log('SendBird secret: ' + process.env.sendbirdkey);
// $env:sendbirdkey="<SECRET>"; node server.js
