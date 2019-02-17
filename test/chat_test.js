/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('/token should create a chat token', async function () {
        const res = await request.post(`/chat/token/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`);
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'object');
        assert.typeOf(res.body.chat_token, 'string');
        assert.typeOf(res.body._id, 'string');
    });
};
