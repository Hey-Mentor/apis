/* eslint-env mocha */
require('dotenv').config();
const mongoose = require('mongoose');

const contactTests = require('./contact_test');
const db_util = require('../tools/db_util');
const profileTests = require('./profile_test');

process.env.NODE_ENV = 'test';

mongoose.connect(process.env.TEST_DB_URL, { useNewUrlParser: true });

/* eslint-disable prefer-arrow-callback */

describe('API Tests', function () {
    before(function (done) {
        // Before running suite we populate the db
        mongoose.connection.once('open', () => {
            db_util.populateDB()
                .then(() => done());
        });
    });

    describe('/profile', profileTests.bind(this));
    describe('/contacts', contactTests.bind(this));
});
