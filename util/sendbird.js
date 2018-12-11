const axios = require('axios');

function getSendBirdUser(userId) {
    // We will use the Hey Mentor user ID as the SendBird user ID
    // Check if the user was already created in SendBird, otherwise, create it
    return checkSendBirdUserExists(userId).then((exists) => {
        if (exists) {
            return userId;
        } else {
            createSendBirdUser(userId, 'Nickname').then((created) => {
                if (created) {
                    return userId;
                } else {
                    console.log('Something went wrong when trying to get the SendBird user');
                    return null;
                }
            });
        }
    });
    /* profile.getProfileFromUserId(userId).then( user => {
        if ( user && user.sendbird_id ){
            return user.sendbird_id
        }else{
            // Create the user through SendBird, and update the DB
            // Note that we should block on DB update before using the new SendBird user
        }
    });*/
}

function checkSendBirdUserExists(userId) {
    console.log('Does SendBird user exist?');

    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.get(`https://api.sendbird.com/v3/users/${userId}`, config)
        .then((response) => {
            if (response && response.data && !response.data.error) {
                console.log('Yes');
                return true;
            }
            console.log('Nope');
            return false;
        })
        .catch((error) => {
            console.log('Nope');
            return false;
        });
}

function createSendBirdUser(userId, name) {
    const data = {user_id: userId, nickname: name, profile_url: '', profile_file: ''};
    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.post(`https://api.sendbird.com/v3/users`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            console.log('Error during createSendBirdUser');
        });
}

function createSendBirdChannel(userIds) {
    // Note: we must use 'is_distinct': true in order to get the existing channel returned
    const data = {user_ids: userIds, is_distinct: true};
    const config = {headers: {'Api-Token': process.env.sendbirdkey}};

    return axios.post(`https://api.sendbird.com/v3/group_channels`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            console.log('Error during createSendBirdChannel');
        });
}

exports.getSendbirdChannel = function(user1, user2) {
    const user1_final = getSendBirdUser(user1[0].user_id);
    const user2_final = getSendBirdUser(user2[0].user_id);

    return Promise.all([user1_final, user2_final]).then((values) => {
        const users = [values[0], values[1]];
        console.log('users:');
        console.log(users);

        const channel_data = createSendBirdChannel(users);
        return channel_data.then((data) => {
            if (data) {
                if (data.channel_url) {
                    console.log(data.channel_url);
                    return data.channel_url;
                }
                console.log('A response was received from SendBird, but we couldn\'t parse the channel URL');
            } else {
                console.log('No response returned from SendBird');
            }

            return null;
        });
    });
};
