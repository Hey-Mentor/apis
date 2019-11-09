const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MediaSchema = new Schema({
    user_info: {
        mentor: {
            type: Schema.Types.ObjectId,
            select: true,
        },
        mentee: {
            type: Schema.Types.ObjectId,
            select: true,
        },
    },
    upload_date: {
        type: Date,
    },
    file_info: {
        name: { /* extracted from the media object */
            type: String,
            required: true,
        },
        type: {
            type: String, /* file extension */
            required: true,
        },
        location: { /* uri or file path */
            type: String,
            required: true,
        },
    },
},
{
    // NOTE: The 'collection' field here must match the "Collection" on the backend
    collection: 'Media',
});

module.exports = mongoose.model('Media', MediaSchema);