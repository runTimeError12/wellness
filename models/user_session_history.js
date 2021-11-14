"use strict";

module.exports = (sequelize, DataTypes) => {
    const USER_SESSION_HISTORY = sequelize.define("user_session_history", {
        user_session_id: {
            field: "user_session_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_start_date: {
            field: "session_start_date",
            type: DataTypes.DATE
        },
        session_end_date: {
            field: "session_end_date",
            type: DataTypes.DATE
        },
        user_device_uuid: {
            field: "user_device_uuid",
            type: DataTypes.STRING
        },
        is_active: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            default: 1
        }
    },
    {
        tableName: "user_session_history"
    });
    USER_SESSION_HISTORY.associate = (models) => {
        USER_SESSION_HISTORY.belongsTo(models.users, {
            foreignKey: "userID"
          });
          USER_SESSION_HISTORY.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });
        USER_SESSION_HISTORY.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
    };
    return USER_SESSION_HISTORY;
}