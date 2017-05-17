/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conversations', {
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    initiating_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    receiving_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_date: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: 'timezone(utc'
    },
    modified_date: {
      type: DataTypes.TIME,
      allowNull: true
    },
    conversation_title: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'conversations'
  });
};
