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
        assert.notExists(res.body.contacts);
        assert.typeOf(res.body._id, 'string');
        assert.notExists(res.body.facebook_id || res.body.google_id);
        assert.notExists(res.body.api_key);
    });

    it('should update a users profile', async function () {
        let res = await request.get(`/profile/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`);
        assert.equal(res.status, 200);
        const gen_interest = res.body.gen_interest;
        const update = {
            gen_interest: 'new interests',
            support: ['college_applications'],
        };

        res = await request.put(`/profile/${process.env.TEST_MENTOR_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`)
            .send({ user: update });
        assert.equal(res.status, 200);
        assert.notEqual(gen_interest, res.body.gen_interest);
        assert.equal(res.body.gen_interest, update.gen_interest);
        assert.deepEqual(res.body.support, update.support);
    });
};
