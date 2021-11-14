
'use strict';

module.exports = (sequelize, DataTypes) => {
  const user_token = sequelize.define('user_token', {
    tokenID: {
      field: "tokenID",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userToken: {
      field: "userToken",
      type: DataTypes.STRING(600),
    },
    userEmail: {
      field: "userEmail",
      type: DataTypes.STRING(60),
    },
    phone: {
        field: "phone",
        type: DataTypes.STRING,
        allowNull: false,
    },
    oldToken: {
      field: "oldToken",
      type: DataTypes.STRING(600),
    },
},
    {
        tableName: "user_token"
    });

    user_token.associate = (models) => {        
        user_token.belongsTo(models.users, {
            foreignKey: "userID"
          });
          
          user_token.belongsTo(models.users, {
            foreignKey: "createdByUserID"
          });
  
          user_token.belongsTo(models.users, {
            foreignKey: "lastUpdatedUserID"
          });       
    };
    return user_token;
}