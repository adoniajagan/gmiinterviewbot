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
  user: 'gmi', // update me
  password: 'sa@12345', // update me
  server: 'gmiinterview.database.windows.net',
  database: 'gmiinterview',
  options: {
	  encrypt : true
       //update me
  }
}

var sql = require('mssql');







var Connection = new Connection(config);
 
var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

function queryDatabase(session,builder){
	var request = new sql.Request();
	session.send("Reading rows from the Table");
    // Read all rows from table
    request = new Request(
        "SELECT TOP 1 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid",
        function(err, rowCount, rows) {
		session.send(session, rowCount);

        }
    );

    request.on('row', function(columns) {
        columns.forEach(function(column) {
		builder.Prompts.text("", column.value);
            
        });
    });

    connection.execSql(request);
}
var bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
	sql.connect(config, function (err) {
	
    if (err) //session.send(" err " + err);
	
	
    // create Request objectS
  
	var request = new sql.Request();
    
    // request.query('SELECT TOP 1 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid', function (err, recordset,rowCount, rows) {
		// session.send(config.user);
        // if (err){
			// session.send(recordset);
		// }
        // else{
			// session.send(recordset);
			// session.send(rowCount);
			
		// }
    // });
	});
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
			 var request1 = new sql.Request();
					request1.query("Insert into [SalesLT].[UserLog] (UserInput,Result) values ('"+results.response+"','13000')")
					.then(function () {


						}).catch(function (err) {
						session.send("Insert err " + err);
					});
        }

        // Greet the user
        session.send("Hi %s!", session.userData.name);
       
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
