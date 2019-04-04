/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    ['contacts', 'profile', 'chat/token'].forEach(function (url_piece) {
        describe(`/${url_piece}`, function () {
            it('should reject a non-existent user', async function () {
                const res = await request.get(`/${url_piece}/123456789123456789123456?token=${process.env.TEST_MENTOR_API_KEY}`);
                assert.equal(res.status, 401);
                assert.isEmpty(res.body);
            });
            it('should reject a bad api key', function (done) {
                request.post(`/${url_piece}/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTOR_API_KEY}`)
                    .then((res) => {
                        assert.equal(res.status, 401);
                        assert.isEmpty(res.body);
                        done();
                    });
            });
        });
    });
};
