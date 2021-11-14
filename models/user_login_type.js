"use strict";

module.exports = (sequelize, DataTypes) => {
    const USER_LOGIN_TYPE = sequelize.define("user_login_type", {
        user_login_type_id: {
            field: "user_login_type_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        login_type_code: {
            field: "login_type_code",
            type: DataTypes.STRING
        },
        login_type_name: {
            field: "login_type_name",
            type: DataTypes.STRING
        },
        is_active: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            default: 1
        }
    },
    {
        tableName: "user_login_type"
    });


    USER_LOGIN_TYPE.associate = (models) => {   };
    return USER_LOGIN_TYPE;
}