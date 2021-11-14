const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");
var Sequelize = require("sequelize");
// const cron = require("../helpers/cron");

/** Setup for a global includes */
module.exports = (express, app) => {
/** Setup for a global includes */
  //app.use(cors());
  //app.options('*', cors());

  // allow cors requests from any origin and with credentials
  app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

  app.use(bodyParser.json({ limit: '20mb' }));
  // parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
  app.use(express.json());

  app.use(
    morgan("common", {
      stream: fs.createWriteStream(path.join(__dirname, "../access.log"), {
        flags: "a"
      })
    })
  );

  app.use(cookieParser());
  
};