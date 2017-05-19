


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

todo:

add a unique constraint to the username and user email columns