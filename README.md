


# SETUP:
1. install Postgres and create a database called "chatdb" at port 5432 
    * You can define your own in a .env file in the root directory with the attribute process.env.DATABASE_URL set to postgres:`host`:`port`/chatdb
    * you can also define an alternate SERVER_PORT

1. run `npm install`

1. create a user/login profile on your chatdb database with the name of your current system user

1. run `$ node models/database.js` to populate your tables

    * if you've created a database in a different spot you'll need to globally install pg, pg-hstore, and sequelize-auto in order to automatically generate models. They wil have to go into the models folder. The command is:```sequelize-auto -o "./models" -d <dbname> -h <host> -u "<user>" -p <port> -x <password> -e postgres```





# AVAILABLE ENDPOINTS:


## GENERAL:
* GET `<host>:<port>/`

	* lists all the available routes and methods

## USERS:

* GET `<host>:<port>/users/<id?>`

	* Returns all users in the database if `id` is empty or not an integer (non-integer IDs will return null). Queryable with `?username=` and `?useremail=`. If `id` is populated with an integer, it returns the user for that id.

* POST `<host>:<port>/users/`
	* Creates or Updates a user for the given `username`. Currently username cannot be updated (Put method by UserID would solve that).
	```
	{
		"username": "Killer Mike",
		"useremail": "mrender@gmail.co",
		"givenName": "Michael Render" << optional
	}
	```
	it returns the new record along with whether it was created or updated. Because of a limitation with Sequelize we cannot return the ID.

* DELETE `<host>:<port>/users/<id>`
	* deletes a single user by ID and returns the number of users deleted (which should be 1)


## CONVERSATION:
* GET `<host>:<port>/users/<userid>/conversations/<conversationid?>`
	* Fetches all conversations for the given `userid`, or if `conversationid` is provided, returns
	that specific conversation by ID

* POST `/users/<userid>/conversations/`
	* Creates a conversation for the given `userid` and a receivinguserid defined in the request body, with an optional conversation title/topic
	```
	{
		"receivingUserID":"10",
		"conversationTitle":"Jordan XX1s" << optional
	}
	```
	> Note: Users cannot have conversations with themselves.

## MESSAGES:

* GET `<host>:<port>/users/<userid>/conversations/<conversationid>/messages/<messageid>`
	* Fetches all messages for the given `conversationid` and `userid`
	or if a `messageid` is provided fetches that specific message by ID
	> Note: in order to fetch a message or collection of messages, the `userid` must be for a user that is a participant of the parent         > conversation
* POST `<host>:<port>/users/<userid>/conversations/<conversationid>/messages/`
	* Creates a message sent from the given `userid` on the given `conversationid`, and requires a body of
	```
	{
		"messageBody":"This is my part, nobody else speak"
	}
	```
	* Works with Emoji :)
	> Note: Requires users to exist before posting the message and be a part of the given conversation
# TODO:
   * More test coverage
   * In order to have better test coverage, need to add mocked/test db
   * Add a unique constraint to the user_handle and user_email columns so that only 1 user can be created per username
   * Allow users to update conversation topics and possibly recipients (maybe 1:many messaging)
   * Delete conversation from a single user's view (may be out of scope)
   * Delete message from single user's view
   * Maybe add a friend functionality at some point?
   * Add push functionality, clients shouldn't need to poll, new messages should emit
   * Enforce more of the built-in constraints in the database, as opposed to in the ORM Model Layer or in non-DB code
# COMPLETED:
* Users:
    * Get List of all users
    * Get single user by id
    * Create user
    * Validate email when a user is created.
    * Update user
    * Delete user
* Conversations:
    * Get List of all threads for a given user
    * Get single thread by id
    * Create thread
    * Validate `POST`s to prevent users from starting conversations with themselves
    * users must exist in order to create conversations
* Messages:
    * Get all messages in the conversation (chronological)
    * get a single message by id
    * Create a message (supports Emoji and non-latin chars)
    * validate `POST`s to prevent users from messaging themselves
    * validate `POST`s to prevent users from messaging conversations they aren't in
    * users must exist in order to send messages
    
# Early Assumptions In Order Of Importance:
* This is a POC/Test, it doesn't have to be production-ready, it's more a test of how I think and my coding values. Given that, I am allowed (limitedly) to use a sub-optimal solution in some places (This is mostly for my storage solution vis-a-vis individual messages).
* These chats only necessarily *need to be* 1:1 between people, but should be built in an extensible way
* Threads don't need to have a subject necessarily

#### Random Musings:
* I think I might also implement a "Entire conversation table" where each record is the entire history of a thread and store conservations as an gestalt object rather than message by message in order to allow for both quick single message lookup by id/text *and* allow for fetching a conservation completely rather than row by row.
