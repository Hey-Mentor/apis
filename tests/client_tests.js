const axios = require('axios');
const port = 3002;


var mentee_id = "id7wxwlfpof7920bj0ct";
var app_id = "1650628351692070";

var access_token = "EAAXdPNyPDSYBAGYy3U5vr0CgTRyx6K4TU0xOUl4yzjLiSo0TyqNSqZACIMM0NgbY2pRFmev2p9VHeYoimVu7TSz5BdcTeDTeELr6COZAwMZCrsAii8RWFecxK8ZACxJGRcEgBEp7RpAlyL1cZAZAA7Bp1N4jJAuIi2QSFqwTTeh3r4aWGjxKfShXp7te6XHCoZD";
var auth_type = "facebook";


/*

To get your facebook access token, navigate to the following URL:

https://www.facebook.com/v3.2/dialog/oauth?client_id=1650628351692070&display=popup&response_type=token&redirect_uri=http://localhost:3002/fbaccess

*/


function test_mentee_list_from_mentor() {
    var mentor_id = "jjksvnevb";
    axios.get(`http://localhost:${port}/unsecure/mentees/${mentor_id}/`)
    .then(response => {
        console.log(response.data);
        if (response.data[0].mentee_ids && response.data[0].mentee_ids.length > 1 ){
            console.log("TEST PASSED");
        }
    })
    .catch(error => {
        console.log(error);
    });
}

function test_get_id_token_facebook(){
    axios.get(`http://localhost:${port}/token/${access_token}/${auth_type}`)
    .then(response => {
        if (response.data.fedToken.length > 0 && response.data.authType == "facebook" && response.data.user_type == "mentee" && response.data.user_id.length > 0){
            console.log(response.data);
            console.log("TEST PASSED");
            return response.data;
        }
    })
    .catch(error => {
        console.log(error);
    });
}

function get_id_token(access_token, auth_type){
    console.log("Get ID Token");
    return axios.get(`http://localhost:${port}/token/${access_token}/${auth_type}`)
    .then(response => {
        console.log("Got a response");
        if (response.data && response.data.fedToken && response.data.fedToken.length > 0 && response.data.authType == "facebook" && response.data.user_type == "mentee" && response.data.user_id.length > 0){
            return response.data;
        }
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}


function get_my_profile_data(id_token){
    return axios.get(`http://localhost:${port}/me/${id_token}`)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
}

function get_contact_profile_data(id_token, userId){
    return axios.get(`http://localhost:${port}/profile/${userId}/${id_token}`)
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });

    return null;
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

function test_user_login_to_facebook() {
/*    FB.login(function(response) {
        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function(response) {
                console.log('Good to see you, ' + response.name + '.');
            });
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    });*/

    //


// https://www.facebook.com//login/device-based/regular/login/?login_attempt=1&next=https%3A%2F%2Fwww.facebook.com%2Fv3.2%2Fdialog%2Foauth%3Fredirect_uri%3Dhttp%253A%252F%252Flocalhost%253A3002%26display%3Dpopup%26response_type%3Dtoken%26client_id%3D1650628351692070%26ret%3Dlogin%26logger_id%3D7e86640f-9a60-cd49-cb53-11ef483f200a&popup=1&lwv=100
// email    xdqakimccj_1542132270@tfbnw.net
// pass    testuserpass

    axios.get(`https://www.facebook.com/v3.2/dialog/oauth?client_id=${app_id}&display=popup&response_type=token&redirect_uri=http://localhost:${port}/fbaccess}`)
    .then(response => {
        //console.log(response.data);
        var popupS = require('popups');

        popupS.alert({
            content: response.data
        });

    })
    .catch(error => {
        console.log(error);
    });

}


//test_mentee_list_from_mentor();
//test_get_id_token_facebook();
//test_get_my_profile();
test_get_contact_profile();

/*constructMenteeItemsFromResponse = async (menteeIds, token) => {
        menteeItems = [];

        for (let mentee of menteeIds) {
            let response = await fetch(
                `https://heymentortestdeployment.herokuapp.com/mentees/${mentee}/${token}`
            );
            let responseJson = await response.json();

            console.log(responseJson);

            fullName =
                responseJson[0].person.fname + ' ' + responseJson[0].person.lname;
            menteeItems.push({
                name: fullName,
                school: responseJson[0].school.name,
                grade: responseJson[0].school.grade,
                id: responseJson[0].mentee_id,
                fullMentee: responseJson[0]
            });
        }

        this.setState({ menteeItem: menteeItems });

        console.log('mentee items');
        console.log(menteeItems);
    };*/
