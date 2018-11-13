'use strict';

exports.validate_token = function(req, res) {

        var token = req.params.token;
        if (!token){
                res.send("Error");
        }

        console.log("Token")
        console.log(token)

        var fbTokenValidationRequest = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
        const axios = require('axios');

        var responseData = axios.get(fbTokenValidationRequest)
            .then(response => {
                //console.log(response.data);
                return response.data;
            })
            .catch(error => {
                console.log(error);
            });

        responseData.then(data => {
                console.log(data);
                var appId = data['data']['app_id'];
                var isValid = data['data']['is_valid'];
        
                console.log(appId);
                console.log(isValid);    

                var correctApp = appId == '1650628351692070';

                console.log("Correct?");
                console.log(correctApp);
                console.log(isValid);
                console.log(correctApp && isValid);

                //res.send(correctApp && validToken)
        });

        res.send();
};








/*{
        "data": {
                "app_id": "1650628351692070",
                "type": "USER",
                "application": "Hey-Mentor",
                "expires_at": 1537806059,
                "is_valid": true,
                "issued_at": 1534624844,
                "scopes": [
                        "user_friends",
                        "email",
                        "public_profile"
                ],
                "user_id": "1842505195770400"
        }
}
*/
