"use strict"


module.exports= (sequelize,DataTypes) => {
    const RECORD = sequelize.define("wb_record",{
        recordID:{
            field:"recordID",
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true

        },
        isCompleted: {
            field: "isCompleted",
            type: DataTypes.BOOLEAN,
            default: 0
        },
        rawJson: {
            field: "rawJson",
            type: DataTypes.STRING(4000)
        },
        notes: {
            field: "notes",
            type: DataTypes.STRING(4000)
        },
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            default: 1
        },  
    },{
        tableName: "wb_record"
    })
    RECORD.associate = (models) => {
        RECORD.belongsTo(models.users,{
            foreignKey:"userID"
        })
        
        RECORD.belongsTo(models.users, {
          foreignKey: "createdByUserID"
        });

        RECORD.belongsTo(models.users, {
          foreignKey: "lastUpdatedUserID"
        });
    };
    return RECORD;
}