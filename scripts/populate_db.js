const mongoose = require('mongoose');

const db_util = require('../tools/db_util');

mongoose.connect(process.env.TEST_DB_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.once('open', () => {
    db_util.populateMedia()
        .then(() => db_util.populateUsers())
        .then(() => mongoose.connection.close());
});
