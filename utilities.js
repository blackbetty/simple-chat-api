var dbInterface = require('./db-interface');

var utilities = {
    checkTwoUsersExist: function(uID1, uID2, cb) {
        dbInterface.fetchUsers('user_id', uID1, function(returnedUsers) {
        	console.log(returnedUsers);
            if (returnedUsers.length != 0) {
                dbInterface.fetchUsers('user_id', uID2, function(returnedUsers2) {
                	console.log(returnedUsers2);
                    if (returnedUsers2.length != 0) {
                        cb(true);
                    } else {
                        cb(false);
                    }
                });
            } else {
                cb(false);
            }
        });
    },
    checkIDsForEquality: function(){


    }
};

module.exports = utilities;
