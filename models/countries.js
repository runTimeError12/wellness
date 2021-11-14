"use strict";

module.exports = (sequelize, DataTypes) => {
    const COUNTRIES = sequelize.define("countries", {
        id: {
            field: "id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sortname: {
            field: "sortname",
            type: DataTypes.STRING
        },
        name: {
            field: "name",
            type: DataTypes.STRING
        },
        phoneCode: {
            field: "phoneCode",
            type: DataTypes.INTEGER
        }
    },
    {
        tableName: "countries"
    });
   
    return COUNTRIES;
}