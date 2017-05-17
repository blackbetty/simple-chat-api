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


User.findAll().then(users => {
    console.log(users)
})


var dbInterface = {

    fetchUsers: function(id) {


    }





}


testDBConnection();
module.exports = dbInterface;
