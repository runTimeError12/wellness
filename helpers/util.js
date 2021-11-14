const jwt = require('jsonwebtoken');

exports.getIdFromToken = (token) => {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decode.sub;
}