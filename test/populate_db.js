const mongoose = require('mongoose');
const faker = require('faker');
require('dotenv').config();

require('../models/users');

const User = mongoose.model('User');

const connectionString = process.env.TEST_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true });

// Keep object ID and API key constant to avoid finding it after every db generation
const OBJECT_ID = '5c15446bbf35ae4057631c3d';
const API_KEY = 'b5697c49ffea4d04a8b0b3c3bbfe8eaf';

const fake_users = new Array(5).fill().map(() => ({
    user_type: faker.random.arrayElement(['mentor', 'mentee']),
    facebook_id: faker.random.alphaNumeric(20),
    google_id: faker.random.alphaNumeric(20),
    api_key: API_KEY,
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
db.once('open', () => {
    User.insertMany(fake_users.slice(1))
        .then(users => User.create(Object.assign(fake_users[0], {
            contacts: users.map(user => user._id),
            _id: OBJECT_ID,
        })))
        .then(() => mongoose.connection.close());
});
