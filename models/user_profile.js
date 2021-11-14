"use strict";

module.exports = (sequelize, DataTypes) => {
    const user_profile = sequelize.define("user_profile", {
        user_profile_id: {
            field: "user_profile_id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fcm_token: {
            field: "fcm_token",
            type: DataTypes.STRING
        },
        dob: {
            field: "dob",
            type: DataTypes.STRING
        },
        profile_img: {
            field: "profile_img",
            type: DataTypes.STRING(4000)
        },
        gender: {
            field: "gender",
            type: DataTypes.STRING
        },
        bridgeHeadID: {
            field: "bridgeHeadID",
            type: DataTypes.STRING(100)
        },
        is_active: {
            field: "is_active",
            type: DataTypes.BOOLEAN,
            default: 1
        }
    },
    {
        tableName: "user_profile"
    });
    user_profile.associate = (models) => {
        user_profile.belongsTo(models.users, {
            foreignKey: "userID"
        });
        user_profile.belongsTo(models.phy_physiotherapist, {
            foreignKey: "physiotherapistID"
          });
        user_profile.belongsTo(models.agent, {
            foreignKey: "agentID"
        });
        user_profile.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });
        user_profile.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
        user_profile.belongsTo(models.countries, {
            foreignKey: "countryID"
          });
    };
    return user_profile;
}