const mongoose = require('mongoose');
const faker = require('faker');
const Promise = require('bluebird');

require('dotenv').config();

require('../models/users');

const User = mongoose.model('User');

const fake_users = new Array(10).fill().map(() => ({
    user_type: faker.random.arrayElement(['mentor', 'mentee']),
    facebook_id: faker.random.alphaNumeric(20),
    google_id: faker.random.alphaNumeric(20),
    api_key: process.env.TEST_API_KEY,
    contacts: [],
    person: {
        fname: faker.name.firstName(),
        lname: faker.name.lastName(),
        kname: faker.name.prefix(),
    },
    demo: {
        race: faker.lorem.word(),
        eth: faker.lorem.word(),
    },
    school: {
        name: faker.lorem.sentence(3),
        grade: 12,
        gpa: faker.finance.amount(2, 4, 2),
        sat: faker.random.number({ min: 400, max: 1200 }),
    },
    gen_interest: faker.lorem.sentences(),
    spec_interests: new Array(3).fill().map(() => faker.lorem.words(1)),
    sports: new Array(3).fill().map(() => faker.lorem.words(1)),
    support: new Array(3).fill().map(() => faker.lorem.words(1)),
}));

// Check fake_users has a value for each schema attribute
User.schema.eachPath((path) => {
    // Ignore mongoose attributes
    if (path[0] === '_') { return; }

    const user = fake_users[0];
    if (path.includes('.')) {
        const keys = path.split('.');
        let prop = user;
        keys.forEach((key) => {
            if (!prop[key]) {
                throw new Error(`Mock data lacking schema property: ${path}`);
            }
            prop = prop[key];
        });
    } else if (!user[path]) {
        throw new Error(`Mock data lacking schema property: ${path}`);
    }
});


module.exports.populateDB = function () {
    return User.deleteMany({}).then(() => {
        User.insertMany(fake_users.slice(1))
            .then(users => users.map(user => user._id))
            .then((user_ids) => {
                const ops = user_ids.map(user_id => User.findByIdAndUpdate(user_id, {
                    contacts: user_ids.filter(id => id !== user_id && Math.random() >= 0.5),
                }));
                ops.push(User.create(Object.assign(fake_users[0], {
                    contacts: user_ids.map(user => user._id),
                    _id: process.env.TEST_USER_ID,
                })));
                return Promise.all(ops);
            });
    });
};
