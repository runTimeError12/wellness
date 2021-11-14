"use strict";

module.exports = (sequelize, DataTypes) => {
    const QUESTION = sequelize.define("wb_question", {
        questionID: {
            field: "questionID",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            field: "title",
            type: DataTypes.STRING
        },
        orderNumber: {
            field: "orderNumber",
            type: DataTypes.INTEGER,
        },        
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            default: 1
        },        
    },
    {
        tableName: "wb_question"
    });
    QUESTION.associate = (models) => {
        QUESTION.belongsTo(models.wb_question_type, {
            foreignKey: "questionTypeID"
          });  
        
        QUESTION.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });

        QUESTION.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
    };
    return QUESTION;
}