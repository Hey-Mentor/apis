const mongoose = require('mongoose');

mongoose.connect(process.env.TEST_DB_URL, { useNewUrlParser: true });

const db = mongoose.connection;

exports.putFile = function (media_file) {

    // return the url to the stored file
    return 'https://localhost/filereference';
};

// expecting a filter: { _id: id }

exports.deleteFile = function(filter) { 

    // return true if deleted, otherwise false
    return true;
};

// expecting a filter: { _id: id }
// TODO: more metadata here?

exports.getFile = function(filter) {

    // return the url to the stored file
    return 'https://localhost/filereference';
};

// expecting a filter: { user_info.mentee : id } or { user_info.mentee : id, user_info.mentor: id }
// TODO: more metadata here?

exports.getFiles = function(filter) {

    // return a collection of urls
    var results = [];
    results.push('https://localhost/filereference');
    results.push('https://localhost/filereference2');

    return results;
}
