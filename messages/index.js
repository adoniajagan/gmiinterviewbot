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

var config = {
  userName: 'gmi', // update me
  password: 'sa@12345', // update me
  server: 'gmiinterview.database.windows.net', // update me
  options: {
      database: 'GMIINTERVIEW' //update me
  }
}
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through

function queryDatabase(session){
    session.send('Reading rows from the Table...');

    // Read all rows from table
    request = new Request(
        "SELECT TOP 1 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid",
        function(err, rowCount, rows) {
            session.send(rowCount + ' row(s) returned');
        }
    );

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            session.send("%s\t%s", column.metadata.colName, column.value);
        });
    });

    connection.execSql(request);
}

  
 
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
	 
	    connection.on('connect', function(err) {
		if (err) {

				 session.send(err);
				   session.send("I am jagan");
	
        if (!session.userData.name) {
            // Ask user for their name
            builder.Prompts.text(session, "Hello... What's your name?");
        } else {
            // Skip to next step
        next();
        }
		}
		else{
			queryDatabase(session)
      
		}
		});
      
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
