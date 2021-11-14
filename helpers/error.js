const log = require("./logger");
class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}
/**
 * @param  {} err
 * @param  {} req
 * @param  {} res
 * @param  {} next
 * @description handle all the exceptions with Error Handler class and send response
 */
const handleError = (err, req, res, next) => {
  const { statusCode, message } = err;
  log.error(err.stack);
  console.log("Inside error handling");
  // res.json({ err: "and error" });
  res.setHeader("Content-type", "application/json");
  res.json({
    data: "error",
    status: statusCode ? statusCode : 400,
    msg: message
  });
};

module.exports = {
  ErrorHandler,
  handleError
};