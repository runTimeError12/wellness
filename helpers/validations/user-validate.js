const Joi = require('joi');
const helper = require('../validate-requres');
const validateRequest =  require('../validate-requres');
const getUserSchema = Joi.object({
    user_id: Joi.number().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string(), 
    phone: Joi.string()
})

const verifyUserSchema = async (req,res, next) =>
 { 
     return validateRequest(req, next, getUserSchema); 
}

module.exports = { verifyUserSchema }

