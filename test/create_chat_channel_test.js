/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('/create chat channel 1', async function () {
        const res = await request.post(`/admin/chat/channel/create?token=${process.env.TEST_MENTEE_API_KEY}`)
            .send({
                device: 'test',
            });
        assert.equal(res.status, 200);
    });

    it('/create chat channel 2', async function () {
        const res = await request.post(`/admin/chat/channel/create?token=${process.env.TEST_MENTEE_API_KEY}`);
        assert.equal(res.status, 400);
    });
};
