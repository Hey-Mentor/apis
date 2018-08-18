var express = require('express'),
  app = express(),
  port = process.env.PORT || 3002,
  mongoose = require('mongoose'),
  Mentees = require('./models/mentee'), 
  Mentors = require('./models/mentors'), 
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
mongoose.Promise = global.Promise;

var connectionString = require('./local');
mongoose.connect(connectionString()); 

//var connectionString = process.env.CONNECTION_STRING;
//mongoose.connect(connectionString); 

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log("DB connection alive");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('API server started on port: ' + port);