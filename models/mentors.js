'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MentorSchema = new Schema({
  mentor_id: {
    type: String
  },
  auth_id: { type: String},
  mentee_ids: { type:[{type:String}]}
},
{
  collection: "Mentors"
});

// NOTE: The 'collection' field here must match the "Collection" on the backend 

module.exports = mongoose.model('Mentors', MentorSchema);