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
        if (response.data && response.data.fedToken && response.data.fedToken.length > 0 ){
            return response.data;
        }
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function get_user_profile_data(id_token, userId){
    return axios.get(`http://localhost:${port}/profile/${userId}?token=${id_token}`)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function get_messages(id_token, userId){
    return axios.get(`http://localhost:${port}/messages/${userId}?token=${id_token}`)
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
    });
}

function test_get_my_messages(){
    var api_key_obj = register_for_api_key(access_token, auth_type);
    api_key_obj.then( api_key => {
        console.log("api_key:");
        console.log(api_key);

        let objJsonStr = JSON.stringify(api_key);
        let encoded = Buffer.from(objJsonStr).toString("base64");

        var data = get_my_profile_data(encoded);
        data.then( user_profile => {
            console.log(user_profile);

            var message_req = get_messages(encoded, user_profile[0].contacts[0]);
            message_req.then( channel => {
                console.log(channel);
            });
        });
    });
}

function test_get_my_profile(){
    var id_token = get_id_token(access_token, auth_type);
    id_token.then( token => {
        console.log("Token:");
        console.log(token);

        let objJsonStr = JSON.stringify(token);
        let encoded = Buffer.from(objJsonStr).toString("base64");

        var data = get_my_profile_data(encoded);
        data.then( user_profile => {
            console.log(user_profile);
            if (user_profile[0].person.fname == "Larry"){
                console.log("TEST PASSED");
            }
        });
    });
}

function test_get_contact_profile(){
    var id_token = get_id_token(access_token, auth_type);
    id_token.then( token => {
        console.log("Token:");
        console.log(token);

        let objJsonStr = JSON.stringify(token);
        let encoded = Buffer.from(objJsonStr).toString("base64");

        var data = get_my_profile_data(encoded);
        data.then( user_profile => {
            console.log(user_profile);

            var contact_req = get_contact_profile_data(encoded, user_profile[0].contacts[0]);
            contact_req.then( user_profile => {
                console.log(user_profile);
            });
        });
    });
}



test_register_user();

//test_mentee_list_from_mentor();
//test_get_id_token_facebook();
//test_get_my_profile();
//test_get_contact_profile();
//test_create_channel();
//test_get_my_messages();