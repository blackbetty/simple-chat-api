/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: true
    },
    user_handle: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_given_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_date: {
      type: DataTypes.TIME,
      allowNull: true
    },
    modified_date: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
};
