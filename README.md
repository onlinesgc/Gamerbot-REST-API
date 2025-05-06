# Gamerbot-REST-API

This is SGC API. The API is mostly used with SGC:s Discord bot "Gamerbot", but is planed in the future to be used on the website too.

# Public routes

Here is a wiki on how to use them

https://github.com/onlinesgc/Gamerbot-REST-API/wiki

# Setup dev environment

### Prerequisite to run the API

- [NodeJS](https://nodejs.org/en).
- A package manager. I use [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- A Mongodb cluster. (Instructions below)
  1. Make an account on [MongoDB](https://www.mongodb.com/developer/)
  2. Create an new project
  3. Create an new cluster in the project
  4. It will ask you to create an login, do it and save down the password and username
  5. When they ask you were you are going to use the cluster, press node.js.
  6. You will now see a string that looks somting like this `mongodb+srv://<Username>:<password>@<clustername>....`. Save this link

### Setup

1. First clone the project `git clone https://github.com/onlinesgc/Gamerbot-REST-API.git`
2. Go into the directory and run `npm run install`
3. You want copy and rename the `.env.example` file to `.env`
4. Edit the `.env` file and add the MongoDB url
5. Now you can run the project. You can do this by running `npm run dev`.
