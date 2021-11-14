const models = require("../../models/db");
const conn = require("../../config/conn");
const { imageUpload } = require("../../helpers/file-upload");
const sequelize = conn;

exports.getLoginType = async (req, res, next) => {
  try {
    let querystring = `SELECT user_login_type_id
        ,login_type_code
        ,login_type_name
    FROM user_login_type where is_active = 1`;

    sequelize
      .query(querystring, {
        replacements: {},
        type: sequelize.QueryTypes.SELECT,
      })
      .then((_type) => {
        res.send({
          status: 200,
          data: _type,
          message: "Login type found successfully",
        });
      })
      .catch((err) => next(err));
  } catch (e) {
    next(e);
  }
};

exports.getCountries = async (req, res, next) => {
  try {
    let querystring = `select id, sortname, name, phoneCode from countries;`;

    sequelize
      .query(querystring, {
        replacements: {},
        type: sequelize.QueryTypes.SELECT,
      })
      .then((country) => {
        res.send({
          status: 200,
          data: country,
          message: "Countries found successfully",
        });
      })
      .catch((err) => next(err));
  } catch (e) {
    next(e);
  }
};

exports.getStateByCountryID = async (req, res, next) => {
  let { country_id } = req.query;
  try {
    let querystring = `  select id, name, country_id from state where country_id = (:country_id)`;

    sequelize
      .query(querystring, {
        replacements: { country_id },
        type: sequelize.QueryTypes.SELECT,
      })
      .then((state) => {
        res.send({
          status: 200,
          data: state,
          message: "State found successfully",
        });
      })
      .catch((err) => next(err));
  } catch (e) {
    next(e);
  }
};

exports.getCitiesByStateID = async (req, res, next) => {
  let { state_id } = req.query;
  try {
    let querystring = `select id, name, state_id from cities where state_id = (:state_id)`;

    sequelize
      .query(querystring, {
        replacements: { state_id },
        type: sequelize.QueryTypes.SELECT,
      })
      .then((cities) => {
        res.send({
          status: 200,
          data: cities,
          message: "Cities found successfully",
        });
      })
      .catch((err) => next(err));
  } catch (e) {
    next(e);
  }
};

exports.upload = async (req, res, next) => {
  console.log("Inside");
  const fileObj = req.body;
  if (fileObj.file && fileObj.size > 0) {
    let Image = await imageUpload(fileObj, next);
    res.send({
      status: 200,
      data: Image,
      msg: `The File has been uploaded successfully`,
    });
  }
};

exports.addDeviceInfo = async (req, res, next) => {
  let {
    userID,
    device_uuid,
    device_model,
    device_manufacturer,
    device_version,
    tokenID,
  } = req.body;

  try {
    
    let deviceInfo = await models.user_device_info.findOne({ where: { user_device_uuid: device_uuid } })
    var token_ID = deviceInfo.tokenID
    if (deviceInfo) {
     
      // var tokenID = deviceInfo.tokenID
      console.log("deviceinfo:", token_ID)
      if (deviceInfo.tokenID) {
        await models.user_token.destroy({
          where: {
              tokenID: token_ID,
              userID: userID
          }
          
      }) 
        let checkUuid = await models.user_device_info.update({
          isLoggedIn: 1,
          is_active: 1,
          userID: userID,
          tokenID: tokenID,
          createdByUserID: userID,
          lastUpdatedUserID: userID,
        }, { where: { user_device_uuid: device_uuid } })

        
        if (checkUuid == 1) {
          res.send({
            status: 200,
            message: "Device info Updated successfully ",
          });
        }
        else {
          res.send({
            status: 401,
            message: "Error while Updating Device Info ",
          });
        }
      }
     else if (deviceInfo.tokenID === null) {
       
        let checkUuid = await models.user_device_info.update({
          isLoggedIn: 1,
          is_active: 1,
          userID: userID,
          tokenID: tokenID,
          createdByUserID: userID,
          lastUpdatedUserID: userID,
        }, { where: { user_device_uuid: device_uuid } })

        
        if (checkUuid == 1) {
          res.send({
            status: 200,
            message: "Device info Updated successfully ",
          });
        }
        else {
          res.send({
            status: 401,
            message: "Error while Updating Device Info ",
          });
        }
      }
      else{
        res.send({
          status: 400,
          message: "Error! ",
        });
      }
      
    }
    else {


      let device = await models.user_device_info.create({
        user_device_uuid: device_uuid,
        user_device_model: device_model,
        user_device_manufacturer: device_manufacturer,
        user_device_version: device_version,
        isLoggedIn: 1,
        is_active: 1,
        userID: userID,
        tokenID: tokenID,
        createdByUserID: userID,
        lastUpdatedUserID: userID,
      });

      res.send({
        status: 200,
        data: device,
        message: "Device info added successfully ",
      });
    }
  } catch (e) {
    next(e);
  }
}

exports.deviceInfo = async (req, res, next) => {
  let { userID } = req.query;
  try {
    let querystring = `    
    select user_device_id, user_device_uuid, user_device_model, user_device_manufacturer, user_device_version, tokenID,  createdAt as LogInDate from user_device_info where is_active = 1 AND isLoggedIn = 1 AND userID = :userID ORDER BY createdAt desc;`;

    sequelize
      .query(querystring, {
        replacements: { userID },
        type: sequelize.QueryTypes.SELECT,
      })
      .then((device) => {
        res.send({
          status: 200,
          data: device,
          message: "Device Info found successfully",
        });
      })
      .catch((err) => {
        res.send({
          status: 400,
          message: "Device Info does not exist",
        });
        console.log("Req, ", err);
      });
  } catch (e) {
    next(e);
  }
};

exports.sessionbegin = async (req, res, next) => {
  let { user_id, device_uuid } = req.query;

  try {
    let session = await models.user_session_history.create({
      session_start_date: new Date(),
      user_device_uuid: device_uuid,
      is_active: 1,
      userID: user_id,
      createdByUserID: user_id,
      lastUpdatedUserID: user_id,
    });

    res.send({
      status: 200,
      data: session.user_session_id,
      message:
        "user session started successfully with session id " +
        session.user_session_id,
    });
  } catch (e) {
    next(e);
  }
};

exports.sessionend = async (req, res, next) => {
  let { session_id } = req.query;
  try {
    let session = await models.user_session_history.update(
      {
        session_end_date: new Date(),
        is_active: 0,
      },
      {
        where: {
          user_session_id: session_id,
        },
      }
    );

    res.send({
      status: 200,
      data: session_id,
      message: "user session closed successfully with session id " + session_id,
    });
  } catch (e) {
    next(e);
  }
};
