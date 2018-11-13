var express = require('express'),
    app = express(),
    port = process.env.PORT || 3002,
    mongoose = require('mongoose'),
    Mentees = require('./models/mentee'),
    Mentors = require('./models/mentors'),
    bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;

//var connectionString = require('./local');
var connectionString = "mongodb://localhost:27017/HeyMentor";
mongoose.connect(connectionString);

//var connectionString = process.env.CONNECTION_STRING;
//mongoose.connect(connectionString);

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log("DB connection alive");
    var Admin = mongoose.mongo.Admin;
    new Admin(db.db).listDatabases(function(err, result) {
        console.log('listDatabases succeeded');
        var allDatabases = result.databases;
        console.log(allDatabases);
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('API server started on port: ' + port);