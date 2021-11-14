"use strict";
const fs = require("fs");
const path = require("path");
const conn = require("../config/conn");
const Sequelize = require("sequelize");
const log = require("../helpers/logger");
const basename = path.basename(__filename);
const db = {};

const sequelize = conn;

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    //var model = sequelize["import"](path.join(__dirname, file));
    var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;