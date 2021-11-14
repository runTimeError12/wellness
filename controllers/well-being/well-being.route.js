const wellBeing = require('./well-being.controller')
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest =  require('../../helpers/validate-requres');
const { verify,isAdmin } = require('../../middlewares/authorize');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('atlasImage');


router.get('/getWellbeingQuestions',verify ,wellBeing.getWellbeingQuestions);
router.get('/getWellbeingOptions',verify ,wellBeing.getWellbeingOptions);
router.post('/addUserAnswer',verify ,wellBeing.addUserAnswer);
router.put('/updateMapAddUserAnswer',verify ,wellBeing.updateMapAddUserAnswer);
router.get('/getWellbeingDetailsByDateRange',verify ,wellBeing.getWellbeingDetailsByDateRange);
router.get('/getWellbeingDetailsByRecordID',verify ,wellBeing.getWellbeingDetailsByRecordID);
router.get('/getWellbeingDetailsAvgOfSumByDateRange',verify ,wellBeing.getWellbeingDetailsAvgOfSumByDateRange);
router.put('/addNotes',verify ,wellBeing.addNotes);

module.exports = router;