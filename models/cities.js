"use strict";

module.exports = (sequelize, DataTypes) => {
    const CITIES = sequelize.define("cities", {
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
        state_id: {
            field: "state_id",
            type: DataTypes.STRING
        }
    },
    {
        tableName: "cities"
    });
   
    return CITIES;
}