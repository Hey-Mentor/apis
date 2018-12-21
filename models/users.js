const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    user_type: {
        type: String,
        enum: ['mentor', 'mentee'],
        required: true,
    },
    facebook_id: {
        type: String,
        required() {
            return !!this.google_id;
        },
        unique: true,
    },
    google_id: {
        type: String,
        required: () => !!this.facebook_id,
        unique: true,
    },
    api_key: { type: String },
    contacts: {
        type: [{
            type: Schema.Types.ObjectId,
        }],
    },
    person: {
        fname: {
            type: String,
            required: true,
        },
        lname: {
            type: String,
            required: true,
        },
        kname: { type: String },
    },
    demo: {
        gender: { type: String },
        race: { type: String },
        eth: { type: String },
    },
    school: {
        name: { type: String },
        grade: { type: String },
        gpa: { type: String },
        sat: { type: String },
    },
    gen_interest: {
        type: String,
    },
    spec_interests: {
        type: Array,
    },
    sports: {
        type: Array,
    },
    support: { type: Array },
},
{
    // NOTE: The 'collection' field here must match the "Collection" on the backend
    collection: 'Users',
});

module.exports = mongoose.model('User', UserSchema);
