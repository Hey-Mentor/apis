'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    user_id: {type: String},
    user_type: {type: String},
    facebook_id: {type: String},
    google_id: {type: String},
    contacts: {type: [{type: String}]},
    person: {
        fname: {type: String},
        lname: {type: String},
        kname: {type: String},
    },
    demo: {
        gender: {type: String},
        race: {type: String},
        eth: {type: String},
    },
    school: {
        name: {type: String},
        grade: {type: String},
        gpa: {type: String},
        sat: {type: String},
    },
    gen_interest: {type: String},
    spec_interests: {type: Array},
    sports: {type: Array},
    support: {type: Array},
},
{
    collection: 'Users',
});

// NOTE: The 'collection' field here must match the "Collection" on the backend

module.exports = mongoose.model('Users', UserSchema);
