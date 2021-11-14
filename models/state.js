"use strict";

module.exports = (sequelize, DataTypes) => {
    const state = sequelize.define("state", {
        id: {
            field: "id",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            field: "name",
            type: DataTypes.STRING
        },
        country_id: {
            field: "country_id",
            type: DataTypes.STRING
        }
    },
    {
        tableName: "state"
    });
   
    return state;
}