var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require("../../models/db");
const conn = require("../../config/conn");
const log = require('../../helpers/logger');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendWelcomeMail, sendPasswordResetMail } = require('../../helpers/sendEmail');
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const { saveToken } = require("../../helpers/tokenLog");
const sequelize = conn;
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


exports.login = async function ({ email, password, msg }) {
    console.log(email, password);

    let querystring = `select  u.user_id, 
    u.first_name, u.last_name,u.password, u.salt, u.phone,
     u.email,u.is_email_verified, u.is_active, u.login_type_id,up.fcm_token,up.dob,up.gender,up.profile_img,c.sortname,c.name as country,c.phoneCode
    from users u
    left join user_profile up on u.user_id=up.userID
    left join countries c on up.countryID=c.id
    where u.email = :email order by uh.createdAt,uw.createdAt DESC`;


    const userResp = await sequelize
        .query(querystring, {
            replacements: { email },
            type: sequelize.QueryTypes.SELECT
        })
    const user = userResp[0]
    if (!user || userResp.length < 1) {
        throw new Error('user with email ' + email + ' is not found!');
    } else if ((user.is_email_verified == false) || (user.is_email_verified == 0)) {
        throw new Error('user not found');
    }
    else if (!user.is_active || user.is_active == 0) {
        throw new Error('user with email ' + email + ' has been marked as inactive!');
    }
    else if (user.login_type_id == 1 && !(password == (await decryptPassword(user.password, user.salt)))) {
        throw new Error('user email or password is incorrect!');

    } else if (user.login_type_id == 2) {
        throw new Error('Invalid login type. You are currently registered with google so please use Google social sign in to log into the application.');

    } else if (user.login_type_id == 3) {
        throw new Error('Invalid login type. You are currently registered with facebook so please use Facebook social sign in to log into the application.');

    } else {
        const token = generateJwtToken(user);
        const refreshToken = generateRefreshToken(user);
        delete user["password"];
        delete user["salt"];

        let tokenObj = {
            userToken: token,
            userEmail: user.email,
            phone: user.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
            userID: user.user_id,
            createdByUserID: user.user_id,
            lastUpdatedUserID: user.user_id,
        }

        let tokenID = await saveToken(tokenObj, models);
        return { ...user, token, tokenID, refreshToken };
    }
}


exports.logout = async (req, res, next) => {

    let transaction;

    const tokenKey = req.body.tokenID;


    const userID = req.body.userID;

    const user = await getAccount(userID);

    let tokenData = await models.user_token.findOne({
        where: {
            tokenID: tokenKey,
            userEmail: user.email,
            userID: userID
        }
    });

    try {
        transaction = await sequelize.transaction();
        if (tokenData) {
            if (tokenData.tokenID === tokenKey) {
                await models.user_device_info.update({
                    isLoggedIn: 0,
                    is_active: 0,
                    tokenID: null
                }, {
                    where: {
                        tokenID: tokenKey,
                        userID: userID
                    }
                }, transaction)
                await models.user_token.destroy({
                    where: {
                        tokenID: tokenKey,
                        userID: userID
                    }

                }, transaction)

                await transaction.commit();

                await res.send({
                    status: 200,
                    message: "Logged Out Succsessfully!"
                })

            }
            else {
                res.send({
                    status: 401,

                    message: "Error occured while Logging Out"
                })
            }
        }
        else {

            res.send({
                status: 401,

                message: "Access Denied: Invalid token provided with request"
            })

        }
    } catch (e) {
        if (transaction) await transaction.rollback();
        await res.send({
            status: 401,

            message: "Error occured while Logging Out"
        })
    }



}

exports.resetNewPassword = async (req, res, next) => {

    var { user_id } = req.body;

    const user = await models.users.findOne({ where: { user_id } });

    var dbOldPassword = await decryptPassword(user.password, user.salt);

    try {

        var oldPassword = req.body.oldPassword;

        if (oldPassword === dbOldPassword) {

            let salt = await generateSalt();
            let dbEnPassword = await encryptPassword(req.body.password, salt);

            user.salt = salt;
            user.password = dbEnPassword;
            await user.save();

            models.users.update({
                salt: salt,
                Password: dbEnPassword
            }, {
                where: {
                    user_id: user_id
                }
            })
                .then(update => {

                    if (update == 1) {
                        res.send({
                            status: 200,
                            message: "Password updated successfully!"
                        })
                    }
                    else {
                        res.send({
                            status: 200,
                            message: "Sorry! cannot update password!"
                        })
                    }

                })
                .catch(err => {
                    res.send({
                        status: 400,
                        message: "Error occurred while updating password"
                    })
                })
        }
        else {
            throw new Error("Old password not matched! Please enter again");

        }

    }
    catch (e) {
        next(e);
    }

}

exports.forgotPassword = async (req, res, next) => {
    let email = req.body.email;

    try {
        await models.users.findOne({
            where: { email }
        }).then(async (user) => {
            if (user) {
                var resetToken = await generateResetToken(user);
                userDetails = { ...omitHash(user.get()), resetToken };
                await sendPasswordResetMail(email, user.user_id, next);
                res.send({
                    status: 200,
                    data: "Email sent successfully",
                    msg: "forget password email sent"
                });

            } else {
                res.send({
                    status: 203,
                    message: "User with provided email doesn't exist. Please check and try again"
                })
            }
        }).catch(e => {
            next(e);
        });
    } catch (e) {
        next(e);
    }
}

exports.resetPassword = async (req, res, next) => {
    let { user_id, password } = req.body;
    console.log('password', user_id, password)

    try {

        let salt;
        let dbEnPassword;
        if (password) {
            salt = await generateSalt();
            dbEnPassword = await encryptPassword(password, salt);
            req.body.password = dbEnPassword
        } else {
            salt = "";
            dbEnPassword = "";
        }
        const user = {
            "salt": salt,
            "password": dbEnPassword,
            "updated_by": user_id,
        }
        let updated = await models.users.update(user, {
            where: { user_id: user_id }
        })
        if (updated == 1) {
            res.send({
                status: 200,
                data: user,
                message: "Password reset successful!"
            })
        }
        else {
            throw new Error('Error occured while resetting password');
        }
    } catch (e) {
        next(e);
    }
}

function generateResetToken(email) {

    return jwt.sign({ email: email }, process.env.RESET_TOKEN_SECRET, { expiresIn: '30m' });
}




exports.refreshToken = async function ({ id, token, tokenKey }) {

    const user = await getAccount(id);

    const newRefreshToken = generateRefreshToken(user);

    // generate new jwt
    const token$ = generateJwtToken(user);

    // return basic details and tokens
    let tokenData = await models.user_token.findOne({
        where: {
            tokenID: tokenKey,
            userEmail: user.email
        }
    });
    if (tokenData) {
        if (tokenData.userToken === token) {


            await models.user_token.update({ userToken: token$, oldToken: tokenData.userToken, updatedAt: new Date() }, { where: { tokenID: tokenKey, userEmail: user.email } });
            // await sequelize.close();
            // res.json({status:200, message: 'Token Refreshed Successfully!' })
        } else {

            throw new Error("Access Denied: Invalid token provided with request");
        }
    } else {

        throw new Error("Access Denied: Invalid token provided with request");
    }
}

function generateJwtToken(user) {

    return jwt.sign({ sub: user.user_id, id: user.user_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
}

function generateRefreshToken(user, ipAddress) {

    return jwt.sign({ sub: user.user_id, id: user.user_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '2d' });
}


async function getAccount(id) {
    const user = await models.users.findByPk(id);
    if (!user) throw 'user not found';
    return user;
}


exports.create = async function (req, res, next) {
    let userObj = req.body;
    try {
        let querystring = `SELECT user_id,email,first_name,last_name,phone from users WHERE email= (:email) AND (ISNULL(is_email_verified,0) = 0 OR (is_email_verified = 0))`;
        let checkUserExist = await sequelize
            .query(querystring, {
                replacements: { email: userObj.email },
                type: sequelize.QueryTypes.SELECT
            })
        console.log("chk", checkUserExist)
        let querystring2 = `SELECT 1 from users WHERE email=:email AND is_email_verified=1`;
        let checkUserExist2 = await sequelize
            .query(querystring2, {
                replacements: { email: userObj.email },
                type: sequelize.QueryTypes.SELECT
            })
        console.log(checkUserExist2);


        if (checkUserExist2.length != 0) {
            throw new Error('user with the ' + userObj.email + ' is already taken.');
        }


        let salt;
        let dbEnPassword;
        if (userObj.password) {
            salt = await generateSalt();
            dbEnPassword = await encryptPassword(userObj.password, salt);
            req.body.password = dbEnPassword
        } else {
            salt = "";
            dbEnPassword = "";
        }

        const user = {
            "first_name": userObj.first_name ? userObj.first_name : 'NA',
            "last_name": userObj.last_name ? userObj.last_name : 'NA',
            "phone": userObj.phone ? userObj.phone : 'NA',
            "email": userObj.email,
            "login_type_id": userObj.login_type_id ? userObj.login_type_id : 1,
            "social_login_id": userObj.social_login_id ? userObj.social_login_id : "",
            "salt": salt,
            "password": dbEnPassword,
            "is_email_verified": 0,
            "created_by": 0,
            "updated_by": 0,
            "is_active": 1
        }
        if (checkUserExist.length != 0) {
            console.log("user info", user)
            let updated = await models.users.update(user, {
                where: { email: userObj.email }
            })
            if (updated == 1) {
                let querystring = `SELECT user_id,email,first_name,last_name,phone from users WHERE email=:email`;
                await sequelize
                    .query(querystring, {
                        replacements: { email: userObj.email },
                        type: sequelize.QueryTypes.SELECT
                    }).then(user => {
                        res.send({
                            status: 200,
                            data: user,
                            message: "User updated and registration successful!"
                        })
                    })
                    .catch(err => {
                        res.send({
                            message: "Error occured while updating user!"
                        })
                    })
            }
            else {
                throw new Error('Error occured while updating');
            }
        }

        else {
            let checkUserPhoneExist = await models.users.findOne({ where: { email: userObj.email } })

            if (checkUserPhoneExist) {
                throw new Error('user with the ' + userObj.email + ' is already taken.');
            }

            log.info("????1???");
            await models.users.create(user)
                .then(user => {
                    delete user.dataValues["password"];
                    delete user.dataValues["salt"];
                    res.send({
                        status: 200,
                        data: { user },
                        message: "User registration successful!"
                    })
                })
                .catch(err => {
                    res.send({
                        message: "Error occured while creating user!"
                    })
                })
        }
    }
    catch (e) {
        next(e);
    }
}

exports.sociallogin = async function ({ email, social_login_id, msg }) {
    let querystring = `select u.user_id, u.first_name, u.last_name, u.phone,u.social_login_id,
         u.email, u.is_active, u.login_type_id
        from users u where u.email = (:email)`;


    const userResp = await sequelize
        .query(querystring, {
            replacements: { email },
            type: sequelize.QueryTypes.SELECT
        })
    const user = userResp[0]
    console.log(user);


    if (!user || userResp.length < 1) {
        throw new Error('user with email ' + email + ' is not found!');

    } else if (!user.is_active || user.is_active == 0) {

        res.status(400).send('user with email ' + email + ' has been marked as inactive!')
    } else if (social_login_id != user.social_login_id) {
        'user with email ' + email + ' has been marked as inactive!'
        throw new Error('Incorrect social Login authentication token recieved. Please check and try again');
    } else {

        const token = generateJwtToken(user);
        const refreshToken = generateRefreshToken(user);
        return { ...user, token, refreshToken };
    }
}

// //Helper functions for user

function omitHash(user) {
    const { Password, ...userWithoutHash } = user;
    return userWithoutHash;
}

const generateSalt = async () => {
    return crypto.randomBytes(16).toString("base64");
};

const encryptPassword = async (plainText, salt) => {

    let cipher_name = CryptoJS.AES.encrypt(plainText, salt);
    return cipher_name.toString();
};

const decryptPassword = async (plainText, salt) => {
    let bytes = CryptoJS.AES.decrypt(plainText, salt);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
};


exports.generateOTPEmail = async (req, res, next) => {
    try {
        let { email } = req.body;
        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log(otp);

        let querystring = `UPDATE users
        SET otp = (:otp)
        where email = (:email)`;


        const userResp = await sequelize
            .query(querystring, {
                replacements: { otp, email },
                type: sequelize.QueryTypes.SELECT
            }).then(data => {
                sendOTPEmail(email, otp, next)
                    .then((response) => {
                        console.log(response[0].statusCode)
                        console.log(response[0].headers)
                    })
                    .catch((error) => {
                        console.error(error)
                    })

                res.send({
                    status: 200,
                    data: { otp },
                    msg: "OTP generated successfully and email has been sent to registered email address"
                })
            }).catch(err => next(err));



    } catch (e) {
        next(e)
    }
}

exports.sendWelcomeEmail = async (req, res, next) => {
    try {
        let { userID } = req.body;


        let querystring = `select first_name,last_name,email from users
        where user_id = (:userID)`;


        const userResp = await sequelize
            .query(querystring, {
                replacements: { userID },
                type: sequelize.QueryTypes.SELECT
            }).then((data) => {

                if (data.length) {
                    let { email, first_name, last_name } = data[0];
                    console.log("welcome mail", email)
                    sendWelcomeMail(email, first_name + ' ' + last_name, next)
                        .then((response) => {
                            console.log(response[0].statusCode)
                            console.log(response[0].headers)
                        })
                        .catch((error) => {
                            console.error(error)
                        })

                    res.send({
                        status: 200,
                        data: true,
                        msg: "Welcome email has been sent to registered email address"
                    })
                }
                else {
                    throw new Error(`User doesn't exist`);
                }
            }).catch(err => next(err));



    } catch (e) {
        next(e)
    }
}



exports.verifyOTP = async (req, res, next) => {
    try {
        let { email, otp } = req.query;

        let querystring = `select u.otp
       from users u where u.email = (:email)`;


        const userResp = await sequelize
            .query(querystring, {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT
            }).then(async (user) => {
                console.log(user);
                console.log(user[0].otp);
                console.log(otp);
                if (user[0].otp == otp) {
                    let updated = await models.users.update({ is_email_verified: 1 }, {
                        where: { email }
                    })
                    if (updated == 1) {
                        res.send({
                            status: 200,
                            data: true,
                            msg: "OTP matched and status updated successfully"
                        })
                    }
                    else {
                        throw new Error('OTP matched but verified status not updated successfully');
                    }

                } else {
                    res.send({
                        status: 400,
                        data: false,
                        msg: "Error verifying OTP. Incorrect OTP !"
                    })

                }
            }).catch(err => next(err));



    } catch (e) {
        next(e)
    }
}