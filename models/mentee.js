'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenteeSchema = new Schema({
    mentee_id: { type: String },
    facebook_id: { type: String },
    google_id: { type: String },
    person: {
        fname: { type: String },
        lname: { type: String },
        kname: { type: String },
        fburl: { type: String },
    },
    demo: {
        gender: { type: String },
        race: { type: String },
        eth: { type: String }
    },
    school: {
        name: { type: String },
        grade: { type: String },
        gpa: { type: String },
        sat: { type: String }
    },
    gen_interest: { type: String },
    spec_interests: {type: Array },
    sports: {type: Array },
    support: {type: Array }
},
{
    collection: "Mentees"
});

module.exports = mongoose.model('Mentees', MenteeSchema);
