# Hey Mentor API Surface

[![Build Status](https://travis-ci.com/Hey-Mentor/apis.svg?branch=master)](https://travis-ci.com/Hey-Mentor/apis)

## Overview

The project contains the API surface that supports the following Hey Mentor projects. See the API Surface section below for more details.

1. Hey Mentor Mobile Application


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

    Under the new database, create a new collection: `Users`

6. In the `Users` table, copy the users.json entries. You can do this in MongoDB Compass by navigating to the appropriate collection, and then clicking "Collection" > "Import Data" from the toolbar.

7. Clone our [API project](https://github.com/Hey-Mentor/apis)

8. In `server.js`, update the connection string to point to localhost (commented out in the code)

9. To test that your deployment is working, run the API server code (`node server.js`), and then execute the `client_tests.js` test file under the `\tests` directory.

In order to execute these tests, you will need to have a valid test user access token for the Facebook app. You can get an access token by navigating to the [Facebook app portal](https://developers.facebook.com/apps/1650628351692070/roles/test-users/) and clicking "Edit" > "Get an access token for this test user".

10. __Running with SendBird:__ In order to run the SendBird APIs, you will need to configure a SendBird application (or ask other devs for an existing one). You will then need to execute the server with an environment variable containing the SendBird API key. 

To do this on Windows, you can run:  `$env:sendbirdkey="<SECRET>"; node server.js`


# API Surface

## Mobile App API Surface

__Endpoint__: `/token/<facebook||google>?access_token=<token>`

Upgrades a federated identity access token (example: a Facebook access token) for a Hey Mentor identity token, which can be used to authenticate to the API.

Additionally, the identity token is used by the mobile application to determine app behavior, such as whether to present the "Mentor" or "Mentee" UI flow.

Response: Identity Token, User ID, or Error


__Endpoint__: `/profile/:userId?token=<token>`

Gets the user data of the given user. The token must be a Hey Mentor Identity token.

Note: a user is only allowed to access his/her own profile data, or the profile data of a related user (the user's mentees or mentor)

Response: User profile details, or Error


__Endpoint__: `/me/:userId?token=<token>`

Gets the user data of the current user. The token must be a Hey Mentor Identity token.

Note: a user is only allowed to access his/her own profile data, or the profile data of a related user (the user's mentees or mentor)

Response: User profile details, or Error


__Endpoint__: `/messages/:userId?token=<token>`

Gets the messages between the current user and the user specified by `userId`. The token must be a Hey Mentor Identity token.

Response: Messages, or Error
