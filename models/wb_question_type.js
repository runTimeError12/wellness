"use strict";

module.exports = (sequelize, DataTypes) => {
    const wb_question_type = sequelize.define("wb_question_type", {
        questionTypeID: {
            field: "questionTypeID",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            field: "name",
            type: DataTypes.STRING
        },
        description: {
            field: "description",
            type: DataTypes.STRING(4000)
        },
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            default: 1
        },        
    },
    {
        tableName: "wb_question_type"
    });
    wb_question_type.associate = (models) => {
        
        wb_question_type.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });

        wb_question_type.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
    };
    return wb_question_type;
}