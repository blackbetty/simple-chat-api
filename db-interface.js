const pg = require('pg');
const path = require('path');
const Sequelize = require('Sequelize');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/chatdb';
const sequelize = new Sequelize(connectionString);


// Check to see if we can connect to the given database
var testDBConnection = function() {
    sequelize
        .authenticate()
        .then(err => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
}

// Build our Sequelize Models, the capitalized and singular names are a convention in the Sequelize docs
const User = sequelize.import(__dirname + "/models/users.js");
const Conversation = sequelize.import(__dirname + "/models/conversations.js");
const Message = sequelize.import(__dirname + "/models/messages.js");

// If a query comes back null, we replace the result with a message saying so
// function replaceNullResult(queryResult) {
//     var finalResult; // = queryResult ? queryResult : 'no record was found for that value of the given parameter';

//     if ((typeof(queryResult) === 'undefined') || queryResult.length === 0) {
//         finalResult = 'no record was found for the values of the given parameter(s)';
//     }
//     return finalResult;
// }


var dbInterface = {

    // returns the user for the given parameter and value or null if not found.
    // If no parameters are specified, returns all users
    fetchUsers: function(parameter, value, callback) {
        if (parameter) {
            var criteria = {};
            criteria[parameter] = value;
            try {
                User.findOne({ where: criteria }).then(user => {
                    // user = replaceNullResult(user);
                    callback(user);
                });
            } catch (e) {
                console.log('Username lookup failed for the user_name ' + uName + ' with error: ' + e);
            }
        } else {
            User.findAll().then(users => {

                // returns the user for the given id or null if not found
                // users = replaceNullResult(users);
                callback(users);
            });
        }
    },
    upsertUser: function(user, callback) {
        var givenName = user['givenName'] ? user['givenName'] : null;
        User.upsert({
            user_handle: user.username,
            user_email: user.useremail,
            user_given_name: givenName
        }).then(upsertedOrError => {
            // if the record is created, upsertedOrError == true, if it's updated upsertedOrError == false
            // so we just return the new state of the record
            if (!(upsertedOrError instanceof Error)) {
                callback(user);
            } else {
                callback({
                    Error: 'Database upsert failed with error: ' + upsertedOrError,
                    status: 500
                });
            }

        });
    },
    deleteUser: function(userID, callback) {
        User.destroy({
            where: {
                user_id: userID //this will be your id that you want to delete
            }
        }).then(numberOfUsersDeleted => {
            callback(numberOfUsersDeleted);
        });
    },
    fetchConversationsForUser: function(userID, conversationID, callback) {
        var criteria = {};
        if (conversationID) {
            criteria['conversation_id'] = conversationID
        }
        Conversation.findAll({
            where: Sequelize.and(
                criteria,
                Sequelize.or({
                    initiating_user_id: userID
                }, {
                    receiving_user_id: userID
                })
            )
        }).then(conversations => {
            callback(conversations);
        });
    },
    // Since Users and Conversations function slightly differently,
    // it's simpler to keep conversation create and update as separate functions
    createConversation: function(conversationObject, callback) {
        Conversation.upsert({
            initiating_user_id: conversationObject.username,
            receiving_user_id: conversationObject.receivingUserID,
            conversation_title: conversationObject.conversationTitle
        }).then(upsertedOrError => {
            // if the record is created, upsertedOrError == true, if it's updated upsertedOrError == false
            // so we just return the new state of the record
            if (!(upsertedOrError instanceof Error)) {
                callback(conversationObject);
            } else {
                callback({
                    Error: 'Database upsert failed with error: ' + upsertedOrError,
                    status: 500
                });
            }

        });
    },
   	fetchMessagesForConversation: function(userID, conversationID, messageID, callback) {

        // If the messageID is provided we included it in the SQL Query Criteria,
        // otherwise we leave it blank
        var criteria = {
        	'conversation_id':conversationID
        };
        if (messageID) {
            criteria['message_id'] = messageID
        }
        Message.findAll({where: criteria}).then(conversations => {
            callback(conversations);
        });
    }
}


testDBConnection();
module.exports = dbInterface;
