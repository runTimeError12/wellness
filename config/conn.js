"use strict";
const Sequelize = require("sequelize");
const log = require("../helpers/logger");

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

const conn = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      connectTimeout: 0,
      options: {
        debug: { packet: true, data: true, payload: true, token: true },
        encrypt: true,
        enableArithAbort: true,
        requestTimeout: 300000
      }
    },
   // timezone: "+00:00", //for writing to database
    pool: {
      max: 50,
      min: 1,
      acquire: process.env.DB_POOL_ACQUIRE,
      idle: process.env.DB_POOL_IDLE,
    },
    quoteIdentifiers: false, // set case-insensitive
  }
);

//Checking connection status
conn
  .authenticate()
  .then(() => {
    log.debug("Connection has been established successfully.");
  })
  .catch(err => {
    log.error("Unable to connect to the database:", err);
  });

module.exports = conn;