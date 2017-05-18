/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    message_body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_date: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: 'timezone(utc'
    }
  }, {
    tableName: 'messages',
    timestamps: false
  });
};
