/* eslint-env mocha */
const chai = require('chai');

chai.use(require('chai-http'));

const app = require('../server');

const assert = chai.assert;
const request = chai.request(app).keepOpen();

/* eslint-disable prefer-arrow-callback */

module.exports = function () {
    it('should GET a users contacts', async function () {
        const res = await request.get(`/contacts/${process.env.TEST_MENTEE_USER_ID}?token=${process.env.TEST_MENTEE_API_KEY}`);
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'object');
        assert.typeOf(res.body.contacts, 'array');
        assert.notExists(res.body.contacts[0].api_key);
        assert.typeOf(res.body._id, 'string');
        res.body.contacts.forEach((contact) => {
            assert.hasAllKeys(contact, ['__v', '_id', 'person', 'demo', 'gen_interest', 'spec_interests', 'user_type',
                'sports', 'school', 'support', 'facebook_id', 'chat'], contact);
        });
    });
};
