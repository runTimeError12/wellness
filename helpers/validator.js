var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require("../models/db");
const conn = require("../config/conn");
const log = require('./logger');

const isUserExist = async (userID, next) =>{
    let user = await models.users.findOne({
        where:{
            user_id: userID
        }
    });

    return user ? true: false;
}
module.exports = { isUserExist }