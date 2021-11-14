const auth = require('./auth.controller');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest =  require('../../helpers/validate-requres');
const { verify,isAdmin } = require('../../middlewares/authorize');
const jwt = require('jsonwebtoken');
const isEmpty = require('../../helpers/is-empty');

router.post('/login', authenticate);
router.post('/sociallogin', socialauthenticate);
router.post('/logout',verify, auth.logout);

router.post('/register', auth.create);
router.post('/generateOTPEmail', auth.generateOTPEmail);
router.get('/verifyOTP', auth.verifyOTP);

router.post('/refreshToken', refreshToken);

 router.post('/forgotPassword', auth.forgotPassword);
router.post('/sendWelcomeEmail', auth.sendWelcomeEmail);



router.post('/reset-password', auth.resetPassword);

 router.put('/resetNewPassword',verify, auth.resetNewPassword);



async function authenticate(req, res, next){
    console.log("inside");
    const { email, password } = req.body;
    const schema = Joi.object({
        email : Joi.string().required(),
        password : Joi.string().required()
    });

  let result =  await validateRequest(req, next, schema);
  if (!isEmpty(result.errors)) {
    return res.status(400).json(result.errors);
}

    auth.login({ email, password })
    .then(account => {
        res.json(account);
    })
    .catch(next);
}

async function socialauthenticate(req, res, next){
    console.log("inside");
    const { email, social_login_id } = req.body;
    const schema = Joi.object({
        email : Joi.string().required(),
        social_login_id : Joi.string().required()
    });

  let result =  await validateRequest(req, next, schema);
  if (!isEmpty(result.errors)) {
    return res.status(400).json(result.errors);
}

auth.sociallogin({ email, social_login_id })
    .then(account => {
        res.json(account);
        
    })
    .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.body.token;
   
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
    const tokenKey = req.body.tokenID;
    const id = decode.sub;
    console.log(id, token, tokenKey);
     auth.refreshToken({id,  token, tokenKey })
        .then(() => {
            res.json({status:200, message: 'Token Refreshed Successfully!' })
           
        })
        .catch(next);
}


function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
 //   console.log("req get ", req.get('host'));
 auth.forgotPassword(req.body, req.get('host'))
        .then(() => res.json({status:200, message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    auth.resetPassword(req.params.resetToken, req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}


function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

module.exports = router;