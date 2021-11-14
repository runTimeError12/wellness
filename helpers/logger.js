/**
 * @description Library for logging node JS service
 * @reference https://github.com/trentm/node-bunyan
 */
 const bunyan = require("bunyan");
 require("dotenv").config();
 /** Initialize the logger */
 const log = bunyan.createLogger({
   name: "atlas",
   streams: [
     {
       level: "info",
       stream: process.stdout // log INFO and above to stdout
     },
     {
       level: "error",
       path: "./error.log" // log ERROR and above to a file
     }
   ]
 });
 
 module.exports = log;