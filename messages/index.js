/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var sql = require('mssql');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var con  = {
    server: 'gmiinterview.database.windows.net',
    database: 'gmiinterview',
    user: 'gmi',
    password: 'sa@12345'
	
};

  
 
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
        session.send("I am jagan");
		// sql.connect(con, function (err) {

			// if (err) session.send(err);
			// var request = new sql.Request();
			// request.query('select * from SalesLT.UserLog', function (err, recordset) {
				// if (err) session.send(err)
					// session.send(recordset);
				// });
			// });

        
        if (!session.userData.name) {
            // Ask user for their name
            builder.Prompts.text(session, "Hello... What's your name?");
        } else {
            // Skip to next step
        next();
        }
    },
    function (session, results) {
        // Update name if answered
        if (results.response) {
            session.userData.name = results.response;
        }

        // Greet the user
        session.send("Hi jagan %s!", session.userData.name);
       
    }
   
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
