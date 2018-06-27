# Hey Mentor API Surface 

## Overview 

The project contains the API surface that supports the following Hey Mentor projects. See the API Surface section below for more details.  

1. Hey Mentor Mobile Application 

2. Hey Mentor Admin Experience 


## Requirements 

1. __Node.js and NPM__


2. __Express module__

    npm install express

3. __Mongoose module__

    npm install mongoose

## Running the backend 

In the `/api` directory, run:

    node server.js 

## Testing the backend 

The backend datastore contains mentees with the following matched mentor IDs: 

* bdkenslvl

* enslbbale

* elksvneks

* none

# API Surface 

## Mobile App API Surface 

__Endpoint__: `/mentees/<menteeId>`

Gets the mentee for the given mentee ID

Response: Mentee details, or Error    


__Endpoint__: `/mentors/<mentorId>`

Gets the mentor for the given mentor ID 

Response: Mentor details, or Error    
