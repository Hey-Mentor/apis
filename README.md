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

## Running Against a Local Database 

Currently there is a test deployment of the MongoDB data which the API queries against. However, if you wish to make changes to the data schema, or make more complex API changes, you should run the API against your own deployment of the database. 

You can set up your own deployment by following these steps: 

1. [Install MongoDB](https://docs.mongodb.com/v3.2/administration/install-community/)
    
    You can download the community server if you want to run the DB locally, or you can sign up for MongoDB Atlas, which is free cloud hosting of a Mongo DB instance. 

    This tutorial will assume that you are deploying the community server version. 

    Special notes for installing on Windows:

        * Choose the MSI installer

        * Use default settings to install as network service

        * You may need to create a folder C:\data\db  


2. Execute Mongo DB once you have it installed 
    
    For Windows, "C:\Program Files\MongoDB\Server\4.0\bin\mongod.exe"


3. Install [MongoDB Compass](https://www.mongodb.com/products/compass), or any perferred Mongo DB UI 

4. In MongoDB Compass, connect to localhost (you can use default settings), or to the location of your Mongo DB 

5. Create one database called `HeyMentor` (only do this the first time you set up)

    Under the new database, create two collections:
        `Mentors` and `Mentees`

6. In the appropriate table, copy the mentees.json entries and the mentors.json entries. You can do this in MongoDB Compass by navigating to the appropriate collection, and then clicking "Collection" > "Import Data" from the toolbar.

7. Clone our [API project](https://github.com/Hey-Mentor/apis) 

8. In `server.js`, update the connection string to point to localhost (commented out in the code)

9. To test that your deployment is working, run the API server code (`node server.js`), and then execute the `client_tests.js` test file under the `\tests` directory.


# API Surface 

## Mobile App API Surface 

__Endpoint__: `/mentees/<menteeId>`

Gets the mentee for the given mentee ID

Response: Mentee details, or Error    


__Endpoint__: `/mentors/<mentorId>`

Gets the mentor for the given mentor ID 

Response: Mentor details, or Error    
