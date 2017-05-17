const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/chatdb';

const client = new pg.Client(connectionString);
client.connect();
// This query is a bit dense, there's probably a more elegant solution,
// but this seemed like the simplest way to generate the database.
const query = client.query(
    'CREATE TABLE IF NOT EXISTS users(\
		user_id SERIAL PRIMARY KEY,\
		user_handle VARCHAR(30) not null,\
		user_email VARCHAR(254) not null,\
		user_given_name VARCHAR(256),\
		created_date timestamp with time zone default (now() at time zone \'utc\'),\
		modified_date timestamp with time zone default (now() at time zone \'utc\')\
  	);\
  	CREATE TABLE IF NOT EXISTS conversations(\
  		conversation_id SERIAL PRIMARY KEY,\
  		initiating_user_id INTEGER,\
  		receiving_user_id INTEGER,\
  		created_date timestamp with time zone default (now() at time zone \'utc\'),\
  		modified_date timestamp with time zone,\
  		conversation_title VARCHAR(50)\
  	);\
  	CREATE TABLE IF NOT EXISTS messages(\
  		message_id SERIAL PRIMARY KEY,\
  		conversation_id INTEGER,\
  		sender_id INTEGER,\
  		recipient_id INTEGER,\
  		message_body TEXT,\
  		created_date timestamp with time zone default (now() at time zone \'utc\')\
  	);\
  	-- Drop the constraints if they exist for the intended name and create our own\
  	ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_users_initiatinguserid;\
  	ALTER TABLE conversations\
   		ADD CONSTRAINT fk_conversations_users_initiatinguserid\
   		FOREIGN KEY (initiating_user_id)\
   		REFERENCES users(user_id);\
   	ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_users_receivinguserid;\
   	ALTER TABLE conversations\
   		ADD CONSTRAINT fk_conversations_users_receivinguserid\
   		FOREIGN KEY (initiating_user_id)\
   		REFERENCES users(user_id);\
   	ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_conversations_conversation_id;\
   	ALTER TABLE messages\
   		ADD CONSTRAINT fk_messages_conversations_conversation_id\
   		FOREIGN KEY (conversation_id)\
   		REFERENCES conversations(conversation_id);\
   	ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_users_sender_id;\
   	ALTER TABLE messages\
   		ADD CONSTRAINT fk_messages_users_sender_id\
   		FOREIGN KEY (sender_id)\
   		REFERENCES users(user_id);\
   	ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_users_recipient_id;\
   	ALTER TABLE messages\
   		ADD CONSTRAINT fk_messages_users_recipient_id\
   		FOREIGN KEY (recipient_id)\
   		REFERENCES users(user_id);\
  	');
query.on('end', () => { client.end(); });
