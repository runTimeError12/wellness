"use strict";

module.exports = (sequelize, DataTypes) => {
    const SUBJECTIVE_RATING = sequelize.define("wb_subjective_rating", {
        subjectiveRatingID: {
            field: "subjectiveRatingID",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            field: "name",
            type: DataTypes.STRING
        },
        rate: {
            field: "rate",
            type: DataTypes.INTEGER
        },
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            default: 1
        },        
    },
    {
        tableName: "wb_subjective_rating"
    });
    SUBJECTIVE_RATING.associate = (models) => {
        
        SUBJECTIVE_RATING.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });

        SUBJECTIVE_RATING.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
    };
    return SUBJECTIVE_RATING;
}