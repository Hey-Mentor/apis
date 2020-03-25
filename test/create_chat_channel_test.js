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
                user_ids: [`${process.env.TEST_MENTEE_USER_ID}`, `${process.env.TEST_MENTOR_USER_ID}`],
            });
        assert.equal(res.status, 201);
    });

    it('channel creation should fail for regular credential', async function () {
        const res = await request.post(`/admin/chat/channel/create?token=${process.env.TEST_MENTEE_API_KEY}`)
            .send({
                device: 'test',
                user_ids: [`${process.env.TEST_MENTEE_USER_ID}`, `${process.env.TEST_MENTOR_USER_ID}`],
            });
        assert.equal(res.status, 401);
    });

    it('get contacts after channel creation returns chat channels', async function () {
        await request.post(`/admin/chat/channel/create?token=${process.env.TEST_ADMIN_USER_API_KEY}`)
            .send({
                device: 'test',
                user_ids: [`${process.env.TEST_MENTEE_USER_ID}`, `${process.env.TEST_MENTOR_USER_ID}`],
            });

        const res_mentee = await request.get(`/contacts/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`);
        const res_mentor = await request.get(`/contacts/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`);
        assert.exists(res_mentee.body.contacts[0].chat.channels);
        assert.exists(res_mentor.body.contacts[0].chat.channels);
    });
};
