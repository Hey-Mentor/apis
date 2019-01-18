/* eslint-env mocha */
const mongoose = require('mongoose');
const chai = require('chai');

require('dotenv').config();
chai.use(require('chai-http'));

process.env.NODE_ENV = 'test';

const db_util = require('../tools/db_util');

const app = require('../server');

mongoose.connect(process.env.TEST_CONNECTION_STRING, { useNewUrlParser: true });

const assert = chai.assert;

const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

describe('API', function () {
    before(function (done) {
        // Before running suite we populate the db
        mongoose.connection.once('open', () => {
            db_util.populateDB()
                .then(() => done());
        });
    });

    describe('/GET Bad API key', function () {
        it('should reject an incorrect api key', function () {
            return request.get(`/profile/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`)
                .then((res) => {
                    assert.equal(res.status, 401);
                    assert.isEmpty(res.body);
                })
                .catch((err) => {
                    assert.fail(err);
                });
        });
    });

    describe('/GET Bad User ID', function () {
        it('should reject a non-existent user', function () {
            return request.get(`/profile/123456789123456789123456?token=${process.env.TEST_MENTOR_API_KEY}`)
                .then((res) => {
                    assert.equal(res.status, 401);
                    assert.isEmpty(res.body);
                })
                .catch((err) => {
                    assert.fail(err);
                });
        });
    });

    describe('/GET profile', function () {
        it('should GET a users profile', function () {
            return request.get(`/profile/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`)
                .then((res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'object');
                    assert.typeOf(res.body.contacts, 'array');
                    assert.typeOf(res.body._id, 'string');
                    assert.exists(res.body.facebook_id || res.body.google_id);
                })
                .catch((err) => {
                    assert.fail(err);
                });
        });
    });

    describe('/GET contacts', function () {
        it('should GET a mentor users contacts', function () {
            return request.get(`/contacts/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`)
                .then((res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'object');
                    assert.typeOf(res.body.contacts, 'array');
                    assert.notExists(res.body.contacts[0].api_key);
                    assert.typeOf(res.body._id, 'string');
                    res.body.contacts.forEach((contact) => {
                        if (contact.user_type === 'mentor') {
                            assert.hasAllKeys(contact, ['_id', 'person', 'demo', 'gen_interest', 'spec_interests', 'user_type', 'sports']);
                        } else {
                            assert.hasAllKeys(contact, ['_id', 'person', 'demo', 'gen_interest', 'spec_interests', 'user_type', 'sports', 'school']);
                        }
                    });
                })
                .catch((err) => {
                    assert.fail(err);
                });
        });
    });

    describe('/GET contacts', function () {
        it('should GET a mentee users contacts', function () {
            return request.get(`/contacts/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`)
                .then((res) => {
                    assert.equal(res.status, 200);
                    assert.typeOf(res.body, 'object');
                    assert.typeOf(res.body.contacts, 'array');
                    assert.notExists(res.body.contacts[0].api_key);
                    assert.typeOf(res.body._id, 'string');
                    res.body.contacts.forEach((contact) => {
                        assert.hasAllKeys(contact, ['_id', 'person', 'demo', 'gen_interest', 'spec_interests', 'user_type', 'sports'], contact);
                    });
                })
                .catch((err) => {
                    assert.fail(err);
                });
        });
    });
});
