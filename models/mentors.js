'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentorSchema = new Schema({
    mentor_id: {
        type: String,
    },
    facebook_id: {type: String},
    mentee_ids: {type: [{type: String}]},
},
{
    collection: 'Mentors',
});

// NOTE: The 'collection' field here must match the "Collection" on the backend

module.exports = mongoose.model('Mentors', MentorSchema);
