const mongoose = require('mongoose');
const faker = require('faker');
const Promise = require('bluebird');

require('dotenv').config();

require('../models/users');

const User = mongoose.model('User');

const connectionString = process.env.TEST_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true });

// Keep object ID and API key constant to avoid finding it after every db generation


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

const db = mongoose.connection;

module.exports.populateDB = function () {
    return db.once('open', () => {
        User.deleteMany({}).then(() => {
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
                })
                .then(() => mongoose.connection.close());
        });
    });
};