require('dotenv').config();
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
            // If we can't connect, we exit and leave a message
            console.error('Unable to connect to the database:', err);
            console.error('Please make sure that a database server is running at the correct path and you have permissions.');
            process.exit(1);
        });
}

// Build our Sequelize Models, the capitalized and singular names are a convention in the Sequelize docs
const User = sequelize.import(__dirname + "/models/users.js");
const Conversation = sequelize.import(__dirname + "/models/conversations.js");
const Message = sequelize.import(__dirname + "/models/messages.js");


var dbInterface = {

    // returns the user for the given parameter and value or null if not found.
    // If no parameters are specified, returns all users
    fetchUsers: function(parameter, value, callback) {
        if (parameter) {
            var criteria = {};
            criteria[parameter] = value;
            User.findOne({ where: criteria }).then(user => {
                // for consistency we return an array despite
                // this call returning a single record by id
                var users = [];
                if (user != null) users.push(user);
                callback(users);
            }).catch(function(err) {
                callback({
                    Error: 'Fetch users failed with error: ' + err,
                    status: 500
                });
            });
        } else {
            User.findAll().then(users => {
                callback(users);
            }).catch(function(err) {
                callback({
                    Error: 'Fetch users failed with error: ' + err,
                    status: 500
                });
            });
        }
    },
    upsertUser: function(user, callback) {
        var givenName = user['givenName'] ? user['givenName'] : null;
        User.upsert({
            user_handle: user.username,
            user_email: user.useremail,
            user_given_name: givenName
        }).then(created => {

            // Because Sequelize ORM returns true for created and false for updated on an upsert
            // instead of the record's ID, this is about the best way we can indicate
            // creation vs modification.  I agree, it's not great.
            if (created) {
                user['created'] = true;
            } else {
                user['update'] = true;
            }
            callback(user);
        }).catch(function(err) {
            callback({
                Error: 'User upsert failed with error: ' + err,
                status: 500
            });
        });
    },
    deleteUser: function(userID, callback) {
        User.destroy({
            where: {
                user_id: userID //this will be your id that you want to delete
            }
        }).then(numberOfUsersDeleted => {
            callback(numberOfUsersDeleted);
        }).catch(function(err) {
            callback({
                Error: 'User delete failed with error: ' + err,
                status: 500
            });
        });
    },
    fetchConversationsForUser: function(userID, conversationID, callback) {
        var criteria = {};

        // If we don't pass a ConversationID we just fetch all conversations
        // a user is part of
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
        }).catch(function(err) {
            callback({
                Error: 'Fetch conversations failed with error: ' + err,
                status: 500
            });
        });
    },
    // Since the Users and Conversations tables function slightly differently,
    // it's simpler to keep conversation create and update as separate functions
    createConversation: function(conversationObject, callback) {
        Conversation.upsert({
            initiating_user_id: conversationObject.initiatingUserID,
            receiving_user_id: conversationObject.receivingUserID,
            conversation_title: conversationObject.conversationTitle
        }).then(created => {
            callback(conversationObject);
        }).catch(function(err) {
            callback({
                Error: 'Conversation creation failed with error: ' + err,
                status: 500
            });
        });
    },
    fetchMessagesForConversation: function(userID, conversationID, messageID, callback) {

        // If the messageID is provided we included it in the SQL Query Criteria,
        // otherwise we leave it blank
        var criteria = {
            'conversation_id': conversationID
        };
        if (messageID) {
            criteria['message_id'] = messageID
        }
        Message.findAll({
            where: Sequelize.and(
                criteria,
                Sequelize.or({
                    sender_id: userID
                }, {
                    recipient_id: userID
                })
            )
        }).then(conversations => {
            callback(conversations);
        }).catch(function(err) {
            callback({
                Error: 'Message fetch failed with error: ' + err,
                status: 500
            });
        });
    },
    createMessageForConversation: function(conversationID, senderID, recipientID, messageBody, callback) {
        Message.create({
            conversation_id: conversationID,
            sender_id: senderID,
            recipient_id: recipientID,
            message_body: messageBody
        }).then(message => {
            callback(message);
        }).catch(function(err) {
            callback({
                Error: 'Message creation failed with error: ' + err,
                status: 500
            });
        });
    }
}


testDBConnection();
module.exports = dbInterface;
