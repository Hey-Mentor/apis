/* eslint-env mocha */
require('dotenv').config();
const mongoose = require('mongoose');

const authTests = require('./auth_test');
const chatTests = require('./chat_test');
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
    describe('Authorization', authTests.bind(this));
    describe('/profile', profileTests.bind(this));
    describe('/contacts', contactTests.bind(this));
    describe('/chat', chatTests.bind(this));
});
