const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    user_type: {type: String, enum: ['mentor', 'mentee'], required: true},
    facebook_id: {type: String},
    google_id: {type: String},
    api_key: {type: String, required: true},
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
    // NOTE: The 'collection' field here must match the "Collection" on the backend
    collection: 'Users',
});

UserSchema.index({facebook_id: 1, google_id: 1}, {unique: true});

module.exports = mongoose.model('User', UserSchema);
