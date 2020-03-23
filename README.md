# Hey Mentor API Surface

[![Build Status](https://travis-ci.com/Hey-Mentor/apis.svg?branch=master)](https://travis-ci.com/Hey-Mentor/apis)

## Overview

The project contains the API surface that supports the following Hey Mentor projects. See the API Surface section below for more details.

## Requirements

1. __Node.js and NPM__

2. __MongoDB__

3. __Environment Variables__

## Deploying a Local Database

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


3. Install [MongoDB Compass](https://www.mongodb.com/products/compass), [Robo3T](https://robomongo.org/) or any preferred Mongo DB UI

4. In the UI, connect to your MongoDB database, usually `localhost:27017`

5. Create one database called `HeyMentor` (only do this the first time you set up)

    In the new database, create a new collection: `Users`

6. In order to correctly populate the DB, and to run the API itself, you will need an environment variables file. 

    Under the root project folder, create a new file: `.env`

    If you are part of the Hey Mentor dev team, contact your administrator for the correct `.env` data. 

7. To test that your deployment is working, run the test suite `npm test`

## Deploying locally

`<Set .env with correct variables>`

`npm install`

`npm start`

## Testing

Once you correctly have Mongoose running locally on your machine (following the instructions above),and you have the correct environment variables, you can run `npm run db:populate` to populate the db with a bunch of fake data for local testing and development work.

Before submitting changes, run the test suite locally via `npm test` to identify any test or linting failures


# API Surface

## Mobile App API Surface

__Endpoint__: `/register/<facebook||google>?access_token=<token>`

Upgrades a federated identity access token (example: a Facebook access token) for a Hey Mentor identity token (api key), which can be used to authenticate against the API.

Response: Identity Token, User ID, or Error

#### All of the following calls require a registered API access token 


__Endpoint__: `GET /profile/:userId?token=<token>`

- Gets the user data of the given user.

__Endpoint__: `PUT /profile/:userId?token=<token>`

- Update a users profile data

Body: 
```
{
    user: {
        person: ...
        demo: ...
        .
        .
        .
    }
}
```

__Endpoint__: `GET /contacts/:userId?token=<token>`

- Gets the public contact info of the users contacts.

__Endpoint__: `POST /chat/token/:userId?token=<token>`

- Generates a chat token for client side messaging

Body: 
```
{
    device: <client device ID>
}
```

## Admin APIs

#### All of the following calls require a registered API access token, and the 
#### calling user must be an admin

__Endpoint__: `POST /admin/chat/create/?token=<token>`

- Creates a user account with chat capability, from an existing Hey Mentor user

Body: 
```
{
    user_id: <ID of an existing Hey Mentor user>
}
```


__Endpoint__: `POST /admin/chat/channel/create/:userId?token=<token>`

- Creates a fully-initialized chat channel for communication between a set of users

Body: 
```
{
	"channelName": "Channel name",
	"inviteList": ["User Identity", ... , "5c15446bbf35ae4057111111"]
}
```