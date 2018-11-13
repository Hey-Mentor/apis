const axios = require('axios');
const port = 3002;




// var mentor_id = "4wnu3yl2mrv2lp1evywj";
var mentee_id = "id7wxwlfpof7920bj0ct";






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


test_mentee_list_from_mentor();

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