


SETUP:
install Postgres and create a database called "chatdb" at port 5432 (or define your own in a .env file in the root directory)

npm install

create a user on your postgres database with the name of your current system user (for simplicity, for now)

run `$ node models/database.js`

if you've created a db in a different spot you'll need to globally install pg, pg-hstore, and sequelize-auto in order to automatically generate models. They wil have to go into the models folder. The command is:

sequelize-auto -o "./models" -d <dbname> -h <host> -u "<user>" -p <port> -x <password> -e postgres

todo:

add a unique constraint to the username and user email columns