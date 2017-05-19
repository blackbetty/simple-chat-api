


SETUP:
install Postgres and create a database called "chatdb" at port 5432 (or define your own in a .env file in the root directory)

npm install

create a user on your postgres database with the name of your current system user

run `$ node models/database.js`

if you've created a db in a different spot you'll need to globally install pg, pg-hstore, and sequelize-auto in order to automatically generate models. They wil have to go into the models folder. The command is:

sequelize-auto -o "./models" -d <dbname> -h <host> -u "<user>" -p <port> -x <password> -e postgres





Route Calls:

USERS:

GET <host>:<port>/
	lists all the available routes and methods


GET <host>:<port>/users/
	returns all users in the database. Queryable with ?username= and useremail?=

GET <host>:<port>/users/<id>
	returns a single user by ID in an array of length 1 (for consistent formatting).
	ID must be numeric or NULL will be returned.


POST <host>:<port>/users/
	Creates or Updates a user for the given `username`. Currently username cannot be updated (Put method by UserID would solve that).
	```{
		"username": "Killer Mike",
		"useremail": "dgolant@gmail.co",
		"givenName": "Michael Render" << optional
	}```
	and returns the new record along with whether it was created or updated. Because of a limitation with Sequelize we cannot return the ID.

DELETE <host>:<port>/users/<id>
	deletes a single user by ID and returns the number of users deleted (which should be 1)


Conversations:

GET <host>:<port>/users/<userid>/conversations/<conversationid?>
	Fetches all conversations for the given userID
	or a specific conversation by ID

POST /users/:userid/conversations/
	Creates a conversation for the given userid and receivinguserid, with an optional conversation title/topic
	```{
		"receivingUserID":"10",
		"conversationTitle":"Jordan XX1s"
	}```
	Note: Users cannot have conversations with themselves.

Messages:

GET <host>:<port>/users/<userid>/conversations/<conversationid>/messages/<messageid>
	Fetches all messages for the given conversationID
	or fetch a specific message by ID
POST <host>:<port>/users/<userid>/conversations/<conversationid>/messages/
	Creates a message sent from the given UserID on the given ConversationID, and requires a body of
	```
	{
		"messageBody":"This is my part, nobody else speak"
	}
	```
	Works with Emoji :)
	Requires Users to exist and be a part of the given conversation
todo:

add a unique constraint to the username and user email columns



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
//     X Validate email.
//     X vALIDATE POSTS to prevent users from starting conversations with themselves
//     X validate POSTS to prevent users from messagin themselves
//		X users must exist in order to create conversations