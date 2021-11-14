"use strict";

module.exports = (sequelize, DataTypes) => {
    const wb_sub_record = sequelize.define("wb_sub_record", {
        subRecordID: {
            field: "subRecordID",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            default: 1
        },        
    },
    {
        tableName: "wb_sub_record"
    });
    
    wb_sub_record.associate = (models) => {

        wb_sub_record.belongsTo(models.wb_record,{
            foreignKey:"recordID"
        });

        wb_sub_record.belongsTo(models.wb_question, {
            foreignKey: "questionID"
        });  

        wb_sub_record.belongsTo(models.wb_subjective_rating,{
            foreignKey: "subjectiveRatingID"
        })

        wb_sub_record.belongsTo(models.users, {
            foreignKey: "createdByUserID"
        });

        wb_sub_record.belongsTo(models.users, {
            foreignKey: "lastUpdatedUserID"
        });
    };
    return wb_sub_record;
}