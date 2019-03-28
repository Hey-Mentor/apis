/* eslint-env mocha */
const chai = require('chai');
chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('should GET a users profile', async function () {
        const res = await request.get(`/profile/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`);
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'object');
        assert.typeOf(res.body.contacts, 'array');
        assert.typeOf(res.body._id, 'string');
        assert.exists(res.body.facebook_id || res.body.google_id);
        assert.notExists(res.body.api_key);
    });
};
