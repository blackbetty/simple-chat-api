const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/chatdb';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
    'CREATE TABLE users(\
		user_id SERIAL PRIMARY KEY,\
		user_handle VARCHAR(40) not null,\
		user_email VARCHAR(254) not null,\
		user_given_name VARCHAR(256),\
		created_date timestamp without time zone default (now() at time zone \'utc\'),\
		modified_date timestamp without time zone default (now() at time zone \'utc\')\
  );\
  CREATE TABLE conversations();\
  CREATE TABLE message();');
query.on('end', () => { client.end(); });
