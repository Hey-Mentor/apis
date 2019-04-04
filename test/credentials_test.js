/* eslint-env mocha */
const chai = require('chai');

const credentialController = require('../controllers/credentials.js');

const assert = chai.assert;

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('should create an api key for a user with a valid facebook id', async function () {
        let api_key;
        const req = {
            user: { id: process.env.TEST_FACEBOOK_ID },
        };
        const res = {
            status(status) {
                assert.equal(status, 201);
                return this;
            },
            json(user) {
                api_key = user.api_key;
                return user;
            },
            sendStatus() {
                assert.fail();
            },
        };
        await credentialController.facebookRegister(req, res);
        res.json = function (user) {
            assert.notEqual(user.api_key, api_key);
        };
        await credentialController.facebookRegister(req, res);
    });

    it('should get an api key for a user with a valid facebook id', async function () {
        let api_key;
        const req = {
            user: { id: process.env.TEST_FACEBOOK_ID },
        };
        const res = {
            json(user) {
                api_key = user.api_key;
                return user;
            },
            sendStatus() {
                assert.fail();
            },
        };
        await credentialController.facebookLogin(req, res);
        res.json = function (user) {
            assert.equal(user.api_key, api_key);
        };
        await credentialController.facebookLogin(req, res);
    });
};
