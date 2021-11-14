"use strict";

module.exports = (sequelize, DataTypes) => {
    const USERS = sequelize.define("users", {
        user_id: {
            field: "user_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            field: "first_name",
            type: DataTypes.STRING
        },
        last_name: {
            field: "last_name",
            type: DataTypes.STRING
        },
        
        phone: {
            field: "phone",
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            field: "email",
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            field: "password",
            type: DataTypes.STRING
        },
        salt: {
            field: "salt",
            type: DataTypes.STRING
        },
        created_by:{
            field: "created_by",
            type: DataTypes.INTEGER
        },  
        updated_by: {
            field: "updated_by",
            type: DataTypes.INTEGER
        },
        is_email_verified: {
            field: "is_email_verified",
            type: DataTypes.BOOLEAN,
            default: 0
        },
        is_active: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            default: 1
        },
        otp: {
            field: "otp",
            type: DataTypes.STRING
        },
        social_login_id: {
            field: "social_login_id",
            type: DataTypes.STRING
        }

    },
    {
        tableName: "users"
    });

    USERS.associate = (models) => {  
        USERS.belongsTo(models.user_login_type, {
            foreignKey: "login_type_id"
          });
    };

    

    return USERS;
}