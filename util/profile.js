const mongoose = require('mongoose');

const Users = mongoose.model('Users');

exports.getProfileFromFedId = function(fedId) {
    return Users.find({$or: [{'facebook_id': fedId}, {'google_id': fedId}]}, function(err, user) {
        if (err) {
            console.log('Error getting the user');
            console.log(err);
            return null;
        } else if (user && user.length > 0) {
            console.log('Got the user - getProfileFromFedId');
            return user;
        } else {
            console.log('No matching user');
            return null;
        }
    });
};

exports.getProfileFromUserId = function(userId) {
    return Users.find({'user_id': userId}, function(err, user) {
        if (err) {
            console.log('Error getting the user');
            console.log(err);
            return null;
        } else if (user && user.length > 0) {
            console.log('Got the user - getProfileFromUserId');
            return user;
        } else {
            console.log('No matching user');
            return null;
        }
    });
};
