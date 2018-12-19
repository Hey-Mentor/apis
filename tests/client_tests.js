const axios = require('axios');
const port = process.env.port || 8081;
var app_id = process.env.FACEBOOK_APP_ID;
var access_token = process.env.TEST_ACCESS_TOKEN;
var auth_type = process.env.TEST_AUTH_TYPE;

if (!app_id || !port || !access_token || !auth_type){
    console.log("ERROR RUNNING TESTS: Your environment is not set up with the proper test variables");
}

/*
Client Helper Functions 
*/
function register_for_api_key(access_token, auth_type){
    console.log("Testing 'Register for API Key'");
    return axios.post(`http://localhost:${port}/register/${auth_type}?access_token=${access_token}`)
    .then(response => {
        console.log("Got a response");
        console.log(response);
        if (response.data){
            return response.data;
        }
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function get_user_profile_data(api_key, userId){
    return axios.get(`http://localhost:${port}/profile/${userId}?token=${api_key}`)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function get_messages(api_key, userId){
    return axios.get(`http://localhost:${port}/messages/${userId}?token=${api_key}`)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}


/*
API Helper Functions
*/
function create_sendbird_channel(){
    var userIds = ["mattbo", "joe"];
    var data = { user_ids: userIds, is_distinct: true}
    var config = { headers: { "Api-Token": process.env.sendbirdkey}}

    return axios.post(`https://api.sendbird.com/v3/group_channels`, data, config)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function test_create_channel(){
    var channel_data = create_sendbird_channel();
    channel_data.then( data => {
        console.log("Channel Response:");
        console.log(data);
    });
}


/*
Client Tests
*/

function test_register_user(){
    var api_key_obj = register_for_api_key(access_token, auth_type);
    api_key_obj.then( api_key => {
        console.log("API Key Object:");
        console.log(api_key);
        console.log(api_key.api_key)
    });
}

function test_get_my_messages(){
    var api_key_obj = register_for_api_key(access_token, auth_type);
    api_key_obj.then( api_key => {
        var key = api_key.api_key;
        var data = get_user_profile_data(key, api_key.user_id);
        data.then( user_profile => {
            console.log("Contacts: " + user_profile.contacts[0]);

            var message_req = get_messages(key, user_profile.contacts[0]);
            message_req.then( channel => {
                console.log(channel);
            });
        });
    });
}

function test_get_my_profile(){
    var api_key_obj = register_for_api_key(access_token, auth_type);
    api_key_obj.then( api_key => {

        var data = get_user_profile_data(api_key.api_key, api_key.user_id);
        data.then( user_profile => {
            console.log(user_profile);
        });
    });
}

function test_get_contact_profile(){
    var api_key_obj = register_for_api_key(access_token, auth_type);
    api_key_obj.then( api_key => {
        var key = api_key.api_key;
        var data = get_user_profile_data(key, api_key.user_id);
        data.then( user_profile => {
            console.log(user_profile.contacts[0]);

            var contact_req = get_user_profile_data(key, user_profile.contacts[0]);
            contact_req.then( user_profile => {
                console.log(user_profile);
            });
        });
    });
}



//test_register_user();
//test_get_my_profile();
//test_get_contact_profile();
test_get_my_messages();
