/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('channel creation should succeed for admin credential', async function () {
        const res = await request.post(`/admin/chat/channel/create?token=${process.env.TEST_ADMIN_USER_API_KEY}`)
            .send({
                device: 'test',
                user_ids: [`${process.env.TEST_MENTEE_USER_ID}`],
            });
        assert.equal(res.status, 200);
    });

    it('channel creation should fail for regular credential', async function () {
        const res = await request.post(`/admin/chat/channel/create?token=${process.env.TEST_MENTEE_API_KEY}`)
            .send({
                device: 'test',
                user_ids: ['a', 'b', 'c'],
            });
        assert.equal(res.status, 401);
    });
};
