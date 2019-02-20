/* eslint-env mocha */
require('dotenv').config();
const mongoose = require('mongoose');

const contactTests = require('./contact_test');
const credentialControllerTests = require('./credentials_test');
const db_util = require('../tools/db_util');
const profileTests = require('./profile_test');

process.env.NODE_ENV = 'test';

mongoose.connect(process.env.TEST_DB_URL, { useNewUrlParser: true });

/* eslint-disable prefer-arrow-callback */

describe('API Tests', function () {
    beforeEach(function (done) {
        // Before running suite we populate the db
        db_util.populateDB()
            .then(() => done());
    });

    describe('Credential Controller', credentialControllerTests.bind(this));
    describe('Routes', function () {
        describe('/profile', profileTests.bind(this));
        describe('/contacts', contactTests.bind(this));
    });
});
