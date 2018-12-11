const axios = require('axios');
const { logger } = require('../logging/logger');

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
                    logger.log('info', 'Something went wrong when trying to get the SendBird user');
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
    logger.log('info', 'Does SendBird user exist?');

    const config = { headers: { 'Api-Token': process.env.sendbirdkey } };

    return axios.get(`https://api.sendbird.com/v3/users/${userId}`, config)
        .then((response) => {
            if (response && response.data && !response.data.error) {
                logger.log('info', 'Yes');
                return true;
            }
            logger.log('info', 'Nope');
            return false;
        })
        .catch((error) => {
            logger.log('info', 'Nope');
            return false;
        });
}

function createSendBirdUser(userId, name) {
    const data = { user_id: userId, nickname: name, profile_url: '', profile_file: '' };
    const config = { headers: { 'Api-Token': process.env.sendbirdkey } };

    return axios.post(`https://api.sendbird.com/v3/users`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            logger.log('info', error);
            logger.log('info', 'Error during createSendBirdUser');
        });
}

function createSendBirdChannel(userIds) {
    // Note: we must use 'is_distinct': true in order to get the existing channel returned
    const data = { user_ids: userIds, is_distinct: true };
    const config = { headers: { 'Api-Token': process.env.sendbirdkey } };

    return axios.post(`https://api.sendbird.com/v3/group_channels`, data, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            logger.log('info', error);
            logger.log('info', 'Error during createSendBirdChannel');
        });
}

exports.getSendbirdChannel = function (user1, user2) {
    const user1_final = getSendBirdUser(user1[0].user_id);
    const user2_final = getSendBirdUser(user2[0].user_id);

    return Promise.all([user1_final, user2_final]).then((values) => {
        const users = [values[0], values[1]];
        logger.log('info', 'users:');
        logger.log('info', users);

        const channel_data = createSendBirdChannel(users);
        return channel_data.then((data) => {
            if (data) {
                if (data.channel_url) {
                    logger.log('info', data.channel_url);
                    return data.channel_url;
                }
                logger.log('info', 'A response was received from SendBird, but we couldn\'t parse the channel URL');
            } else {
                logger.log('info', 'No response returned from SendBird');
            }

            return null;
        });
    });
};
