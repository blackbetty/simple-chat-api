const express = require('express');
const app = express();
var bodyParser = require('body-parser');

var responseBuilder = require('./response-builder');
var dbInterface = require('./db-interface');
var listEndpoints = require('express-list-endpoints');

app.use(bodyParser.json());

// Route definitions and methods
app.get('/', function(req, res) {
    var endpoints = listEndpoints(app);
    res.send(endpoints);
})

//fetch all users, or specify a query of username, userid, or useremail
app.get('/users/:id?', function(req, res) {
    var uName = req.query.username;
    var uEmail = req.query.useremail;

    //id not explicitly set
    if (!req.params.id) {
        if (uName) {
            console.log('hit');
            var users = dbInterface.fetchUsers('user_handle', uName, function(returnedUsers) {
                if (!(returnedUsers instanceof Error)) {
                    res.json(returnedUsers);
                } else {
                    res.status(400).send('Bad Request');
                }
            });
        } else if (uEmail) {
            var users = dbInterface.fetchUsers('user_email', uEmail, function(returnedUsers) {
                if (!(returnedUsers instanceof Error)) {
                    res.json(returnedUsers);
                } else {
                    res.status(400).send('Bad Request');
                }
            });
        } else {
            dbInterface.fetchUsers(null, null, function(returnedUsers) {
                if (!(returnedUsers instanceof Error)) {
                    res.json(returnedUsers);
                } else {
                    res.status(400).send('Bad Request');
                }
            });
        }
    } else {
        var users = dbInterface.fetchUsers('user_id', req.params.id, function(returnedUsers) {
            if (!(returnedUsers instanceof Error)) {
                console.log(returnedUsers);
                res.json(returnedUsers);
            } else {
                res.status(400).send('Bad Request');
            }
        });
    }

})

// Creates a user or updates the user for the given username (currently username cannot be updated)
// Returns the new state of the user
app.post('/users/', function(req, res) {
    if (req.body) {
        var user = req.body;
        if (user.username && user.useremail) {
            dbInterface.upsertUser(user, function(returnedUser) {
                res.json(returnedUser);
            });
        } else {
            var errFields = [];
            if (!user.username) {
                errFields.push('username');
            }
            if (!user.useremail) {
                errFields.push('useremail');
            }
            res.status(400).json({
                Error: 'Please provide values for the following fields:' + errFields,
                status: 400
            });
        }
    } else {
        res.status(400).send({
            Error: 'Please provide a user object with at least a username, email, and optionally a given name.',
            status: 400
        });
    }
})

// delete a user by userID
app.delete('/users/:id(\\d+)/', function(req, res) {
    var uID = req.params.id;
    if (uID) {
        dbInterface.deleteUser(uID, function(usersDeleted) {
            if (usersDeleted > 0) {
                res.json(usersDeleted + ' user with ID ' + uID + ' was deleted.');
            } else {
                res.status(500).send({
                    Error: 'User deletion failed. Please be sure the provided ID points to a user.',
                    status: 500
                });
            }
        });
    } else {
        res.status(400).send({
            Error: 'User deletion can only be performed if a valid User ID is provided',
            status: 400
        });
    }
});


//fetch all conversations for the given user, or a specific conversation for the given conversation id
app.get('/users/:userid/conversations/:conversationid?', function(req, res) {
    var conversationID = req.params.conversationid;
    var uID = req.params.userid;

    if ((uID && isNaN(uID)) || (conversationID && isNaN(conversationID))) {
        res.status(400).send('Please be sure both provided IDs are numeric');
        return;
    }
    dbInterface.fetchConversationsForUser(uID, conversationID, function(returnedConversations) {
        if (!(returnedConversations instanceof Error)) {
            res.json(returnedConversations);
        } else {
            res.status(400).send('Bad Request');
        }
    });
})

// Create a conversation between two users
app.post('/users/:userid/conversations/', function(req, res) {

    if (!req.body || !req.body.receivingUserID || !req.params.userid) {
        res.status(400).send('Please provide a userID parameter and a body that includes the receivingUserID');
        return;
    }
    var uID = req.params.userid;
    var conversationObject = {
        initiatingUserID: uID,
        receivingUserID: req.body.receivingUserID,
        conversationTitle: req.body.conversationTitle
    }
    if (uID && isNaN(uID)) {
        res.status(400).send('Please be sure the provided userID is numeric');
        return;
    }
    dbInterface.createConversation(conversationObject, function(returnedConversation) {
        if (!(returnedConversation instanceof Error)) {
            res.json(returnedConversation);
        } else {
            res.status(400).send('Bad Request');
        }
    });
});



// Fetch message by conversation + message ID, or all messages on the conversation
app.get('/users/:userid/conversations/:conversationid/messages/:messageid?', function(req, res) {

    var uID = req.params.userid;
    var cID = req.params.conversationid;
    var mID = req.params.messageid ? req.params.messageid : null;

    if ((uID && isNaN(uID)) || (cID && isNaN(cID)) || (mID && isNaN(mID))) {
        res.status(400).send('Please be sure all provided IDs are numeric');
        return;
    }

    dbInterface.fetchMessagesForConversation(uID, cID, mID, function(returnedConversations) {
        if (!(returnedConversations instanceof Error)) {
            res.json(returnedConversations);
        } else {
            res.status(400).send('Bad Request');
        }
    });
});

// Create a message between two users
app.post('/users/:userid/conversations/:conversationid/messages/', function(req, res) {


    var uID = req.params.userid;
    var cID = req.params.conversationid;
    var messageBody = req.body.messageBody;
    var senderID;

    // All params need to be provided, along with a message
    if (!uID || !cID || !messageBody) {
        res.status(400).send('Please be sure to include all query parameters and a message body, and that your encoding is set to JSON.');
        return;
    }

    // All params must be numeric
    if ((uID && isNaN(uID)) || (cID && isNaN(cID))) {
        res.status(400).send('Please be sure all provided IDs are numeric');
        return;
    }

    senderID = uID;

    // fetch the conversation this message will be created for
    dbInterface.fetchConversationsForUser(uID, cID, function(returnedConversationsCollection) {
        // The user who will recieve the message
        var returnedConversation = returnedConversationsCollection[0];
        var recipientID;

        var userIsConversationInitiator = returnedConversation.dataValues.initiating_user_id == uID
        var userIsConversationReceiver = returnedConversation.dataValues.receiving_user_id == uID
        // We set the receiving_user_id to the other user
        if(userIsConversationInitiator && userIsConversationReceiver){
            res.status(400).send('Users cannot send messages to themselves.');
            return;
        } else if(!userIsConversationInitiator && !userIsConversationReceiver){
            res.status(400).send('User must be part of conversation.');
            return;
        }
        else if (userIsConversationInitiator) {
            recipientID = returnedConversation.dataValues.receiving_user_id;
        } else if (userIsConversationReceiver) {
            recipientID = returnedConversation.dataValues.initiating_user_id;
        } else {
            res.status(400).send('Unknown error');
            return;
        }
        dbInterface.createMessageForConversation(cID, senderID, recipientID, messageBody, function(returnedObject) {
            if (returnedObject) {
                res.json(returnedObject);
            } else {
                res.status(400).send('Bad Request');
            }
        });
    })
});

var server = app.listen(process.argv[2] || 3000, function() {
    var port = server.address().port;
    console.log('chat api listening on port ' + port);
})

module.exports = server;




// Routes I need:
//   Users:
//          X>Get List of all users (maybe add a friend functionality at some point?)
//          X>Get single user by id
//          X>create user
//          X>update user
//          X>delete user
//          Conversations:
//              X>Get List of all threads for a given user
//              X>Get single thread by id
//              X>create thread
//              >update thread (subject, maybe recipients?, etc)...this is extra, do later
//              >delete thread (this would only delete that user's view of the thread, not the thread itself, might be out of scope)
//              Messages:
//                  X>Get all messages in the conversation (chronological)
//                  X>get a single message by id
//                  >Create a message (must support emoji and other non-latin chars!!)
//                  >Delete message from single user's view
// Assumptions In Order Of Importance:
// > This is a POC/Test, it doesn't have to be production-ready, it's more a test of how I think and my coding values.
//      Given that, I am allowed (limitedly) to use a sub-optimal solution in some places (This is mostly for my storage solution vis-a-vis individual messages).
// > These chats only necessarily *need to be* 1:1 between people, but should be built in an extensible way
// > Threads don't need to have a subject necessarily
// > Clients shouldn't need to poll, new events should emit
// Comments:
// I think I might also implement a "Entire conversation table" where each row is the entire history
//      of a thread and store conservations as an gestalt object rather than message by message in order to allow for both quick single message lookup by id/text *and* allow for fetching a conservation completely rather than row by row.
// Extra todos:
//      Validate email.
//      vALIDATE POSTS to prevent users from starting conversations with themselves
//      validate POSTS to prevent users from messagin themselves
