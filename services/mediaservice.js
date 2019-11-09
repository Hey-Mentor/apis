const mongoose = require('mongoose');
const Media = mongoose.model('Media');

/**
*Adds the media file to storage
*@param Media the media file to add
*@returns The media file that was created
*/
exports.putFile = function (media_file) {
    Media.create(media_file)
        .error(err => { throw err.message; })
        .then(media => { return media; })
};

/**
*Deletes the the media files that the provided filter applies to
*@param Object the filter used to gather what files to delete
*@returns Whether or not the delete was successful
*/
exports.deleteFiles = function(filter) { 
    Media.deleteMany(filter)
        .error(err => { return false })
        .then(() => { return true; });
};

/**
*Gets the first media file that the provided filter applies to
*@param Object the filter used to gather what files to delete
*@returns The matching file
*/
exports.getFile = function(filter) {
    Media.findOne(filter)
        .error(err => { throw err.message; })
        .then(media => { return media; });
};

/**
*Gets the media files that the provided filter applies to
*@param Object the filter used to gather what files to delete
*@returns The matching files
*/
exports.getFiles = function(filter) {
    Media.findOne(filter)
        .error(err => { throw err.message; })
        .then(mediaDocs => { return mediaDocs; });
}
