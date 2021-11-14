"use strict";

module.exports = (sequelize, DataTypes) => {
    const user_device_info = sequelize.define("user_device_info", {
        user_device_id: {
            field: "user_device_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_device_uuid: {
            field: "user_device_uuid",
            type: DataTypes.STRING
        },
        user_device_model: {
            field: "user_device_model",
            type: DataTypes.STRING
        },
        user_device_manufacturer: {
            field: "user_device_manufacturer",
            type: DataTypes.STRING
        },
        user_device_version: {
            field: "user_device_version",
            type: DataTypes.STRING
        },
        isLoggedIn:{
            field: "isLoggedIn",
            type: DataTypes.BOOLEAN,
            default: 1,
            allowNull:false
        },
        is_active: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            default: 1
        }
    },
    {
        tableName: "user_device_info"
    });


    user_device_info.associate = (models) => {        
        user_device_info.belongsTo(models.users, {
            foreignKey: "userID"
          });
          user_device_info.belongsTo(models.user_token, {
            foreignKey: "tokenID"
          });
          
          user_device_info.belongsTo(models.users, {
            foreignKey: "createdByUserID"
          });
  
          user_device_info.belongsTo(models.users, {
            foreignKey: "lastUpdatedUserID"
          }); 
    };
    return user_device_info;
}