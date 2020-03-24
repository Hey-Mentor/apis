/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('user creation should succeed for admin credential', async function () {
        const res = await request.post(`/admin/chat/create?token=${process.env.TEST_ADMIN_USER_API_KEY}`)
            .send({
                user_id: [`${process.env.TEST_MENTEE_USER_ID}`],
            });
        assert.equal(res.status, 201);
    });

    it('user creation should fail for regular credential', async function () {
        const res = await request.post(`/admin/chat/create?token=${process.env.TEST_MENTEE_API_KEY}`)
            .send({
                user_id: [`${process.env.TEST_MENTEE_USER_ID}`],
            });
        assert.equal(res.status, 401);
    });

    it('user creation should update twilioInit on user object', async function () {
        await request.post(`/admin/chat/create?token=${process.env.TEST_ADMIN_USER_API_KEY}`)
            .send({
                user_id: [`${process.env.TEST_MENTEE_USER_ID}`],
            });

        const res_mentee = await request.get(`/profile/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`);
        assert.equal(res_mentee.body.chat.twilioInit, 'true');
    });
};
