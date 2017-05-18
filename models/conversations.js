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
      allowNull: false
    },
    receiving_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_date: {
      type: DataTypes.TIME,
      allowNull: true,
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
    tableName: 'conversations',
    timestamps: false
  });
};
