const mongoose = require('mongoose');
const db_util = require('../tools/db_util');

const connectionString = process.env.TEST_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true });

const db = mongoose.connection;

db.once('open', () => {
    db_util.populateDB()
        .then(() => mongoose.connection.close());
});
