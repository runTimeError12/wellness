const jwt = require('jsonwebtoken')
const db = require("../models/db");
const conn = require("../config/conn");

const sequelize = conn;

exports.verify = async function (req, res, next) {

    let accessToken = req.headers['authorization'];

    //if there is no token stored in cookies, the request is unauthorized
    if (!accessToken) {
        return res.status(403).send({
            message: "Invalid request! No authorized token found!"
        })
    }

    let tokenData = " select 1 from user_token where (userToken=:accessToken OR oldToken=:accessToken)"

    let verifyData = await sequelize.query(tokenData, {
        replacements: { accessToken },
        type: sequelize.QueryTypes.SELECT
    })
console.log("verify:" , verifyData)
    if (verifyData.length != 0) {

        let payload
        try {
            //use the jwt.verify method to verify the access token
            //throws an error if the token has expired or has a invalid signature
            payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            next();
        }
    
        catch (e) {
            //if an error occured return request unauthorized error
            return res.status(401).send({
                message: "unauthorized"
            })
        }
    }
    else {
        return res.status(401).send({
            message: "unauthorized!"
        })
    }
}

exports.isAdmin = function (req, res, next) {
    let accessToken = req.headers['authorization'];
    const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    db.user.findByPk(decode.id)
        .then(user => {
            if (user.role === 'Admin') {
                next();
                return;
            }
            else {
                res.status(403).send({
                    message: "Required admin role!"
                })
            }
        })
        .catch(err => {
            res.send({
                message: "Error while getting role"
            })
        })
};

