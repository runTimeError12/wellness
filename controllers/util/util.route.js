const util = require('./util.controller');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest =  require('../../helpers/validate-requres');
const { verify,isAdmin } = require('../../middlewares/authorize');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('atlasImage');


router.get('/getLoginType', util.getLoginType);
router.get('/getCountries', util.getCountries);
router.get('/getStateByCountryID', util.getStateByCountryID);
router.get('/getCitiesByStateID', util.getCitiesByStateID);
router.post('/upload', uploadStrategy, util.upload);
router.get('/sessionbegin', util.sessionbegin);
router.put('/sessionend',verify, util.sessionend);

router.get('/deviceInfo',verify, util.deviceInfo);
router.post('/addDeviceInfo',verify, util.addDeviceInfo);



module.exports = router;