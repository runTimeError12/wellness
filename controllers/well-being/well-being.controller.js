var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require("../../models/db");
const conn = require("../../config/conn");
const helper = require('../../helpers/util');
const log = require('../../helpers/logger');
const { imageUpload } = require("../../helpers/file-upload");
const sequelize = conn;


exports.getWellbeingQuestions= async(req,res,next) =>{
    try{
        let querystring = `;with randomly_sorted_users as (select  *,
          row_number() over(partition by questionTypeID
                              order by rand()) as random_sort
      from  [dbo].[wb_question] )
  select
     *
  from
      randomly_sorted_users
  where
      random_sort <= 2`;
  
            sequelize
                    .query(querystring, {
                      replacements: { },
                      type: sequelize.QueryTypes.SELECT
                    })
                    .then(wb_question => {
                      res.send({
                        status: 200,
                        data: wb_question,
                        message:
                          "Well Being Questions found successfully"
                      });
                    })
                    .catch(err => next(err));
      }catch(e){
        next(e)
      }
}

exports.getWellbeingOptions= async(req,res,next) =>{
  try{
      let querystring = `select subjectiveRatingID,name,rate from wb_subjective_rating where isActive=1`;

          sequelize
                  .query(querystring, {
                    replacements: { },
                    type: sequelize.QueryTypes.SELECT
                  })
                  .then(wb_question => {
                    res.send({
                      status: 200,
                      data: wb_question,
                      message:
                        "Well Being Options found successfully"
                    });
                  })
                  .catch(err => next(err));
    }catch(e){
      next(e)
    }
}

exports.addUserAnswer = async (req, res, next) => {
    try {
      var userID=req.body.userID;
      let record = {
          userID:Number(userID),
          isCompleted:req.body.isCompleted,
          rawJson:req.body.rawJson,
          createdByUserID:Number(userID),
          lastUpdatedUserID:Number(userID),
          isActive:1
      }
      let forSubRecord={
        questionID:Number(req.body.questionID),
        subjectiveRatingID:Number(req.body.subjectiveRatingID),
        createdByUserID:Number(userID),
        lastUpdatedUserID:Number(userID),
        isActive:1
      }
        
        console.log(record);
        models.wb_record.create(record)
            .then(createdRecord => {
              console.log(createdRecord);
              let subRecord={
                recordID:Number(createdRecord.dataValues.recordID),
                  ...forSubRecord
              }
          models.wb_sub_record.create(subRecord).then(retAns=>{
                res.send({
                    status: 200,
                    data: retAns,
                    message: "answer added  succsessfully!"
                })
            }).catch(err => {
            res.send({
                status: 400,
                message: "Error occured while adding answer!"
            })
            console.log("Req, ", err );
            })   
                
            })
            .catch(err => {
                res.send({
                    status: 400,
                    message: "Error occured while adding answer!"
                })
                console.log("Req, ", err );
            })
    }
    catch (e) {
        next(e);
    }

}

exports.updateMapAddUserAnswer = async (req, res, next) => {
    let transaction;
    try {
    transaction = await sequelize.transaction();   
    let recordID =Number(req.body.recordID); 
      var userID=req.body.userID;
      let answer = {
          recordID :recordID,  
          userID:Number(userID),
          rawJson:req.body.rawJson,
          isCompleted:Number(req.body.isCompleted),
          createdByUserID:Number(userID),
          lastUpdatedUserID:Number(userID),
          isActive:1
      }
      
        console.log(answer);
       
        models.wb_record.update(answer,{
            where: { recordID : recordID },
            transaction 
        })
        .then(update => {
            if(update == 1)
            {
                let userAns={
                    recordID:Number(req.body.recordID),
                    questionID:Number(req.body.questionID),
                    subjectiveRatingID:Number(req.body.subjectiveRatingID),
                    isActive:1,  
                    createdByUserID:Number(userID),
                    lastUpdatedUserID:Number(userID),
                  };
                console.log("create ans",userAns);    
                models.wb_sub_record.create(userAns,{transaction}).then(retAns=>{
                    transaction.commit();
                    res.send({
                        status: 200,
                        data: retAns,
                        message: "recorded and sub record updated succsessfully!"
                    })
                }).catch(err => {
                  if (transaction)  transaction.rollback(); 
                res.send({
                    status: 400,
                    message: "Error occured while adding answer!"
                })
                console.log("Req, ", err );
                })       
            }
            else{
                if (transaction)  transaction.rollback(); 
                res.send({
                    message: "Cannot update the wellBeingUserMapping!"
                })
            }
        })
            .catch(err => {
              if (transaction)  transaction.rollback(); 
                res.send({
                    status: 400,
                    message: "Error occured while adding wellBeingUserMapping!"
                })
                console.log("Req, ", err );
            })
    }
    catch (e) {
      if (transaction) await transaction.rollback(); 
        next(e);
    }

}

exports.getWellbeingDetailsByDateRange= async(req,res,next) =>{
    try{
      let {userID, to, from} = req.query;
        let querystring = `SELECT name,CAST(AVG(average) AS decimal(10,3))AS average 
				FROM (SELECT r.recordID,qt.name,AVG(CAST(sjr.rate AS FLOAT)) AS average 
				FROM wb_sub_record sr 
				INNER JOIN wb_record r ON sr.recordID=r.recordID 
				INNER JOIN wb_question q ON sr.questionID=q.questionID
				INNER JOIN wb_question_type qt ON q.questionTypeID=qt.questionTypeID
				INNER JOIN wb_subjective_rating sjr ON sr.subjectiveRatingID=sjr.subjectiveRatingID
				WHERE r.userID=:userID and r.isCompleted=1 AND r.createdAt BETWEEN CAST(:from AS DATETIME) AND CAST(:to AS DATETIME)  GROUP BY r.recordID,qt.name)A
				GROUP BY name`;
  
            sequelize
                    .query(querystring, {
                        replacements: {userID:userID,from:from,to:to},
                        type: sequelize.QueryTypes.SELECT
                    })
                    .then(wb_question => {
                      res.send({
                        status: 200,
                        data: wb_question,
                        message:
                          "Wellbeing Details found successfully"
                      });
                    })
                    .catch(err => next(err));
      }catch(e){
        next(e)
      }
}


exports.getWellbeingDetailsByRecordID= async(req,res,next) =>{
  try{
    let {recordID,userID} = req.query;
      let querystring = `SELECT name,CAST(AVG(average) AS FLOAT)AS average 
      FROM (SELECT r.recordID,qt.name,AVG(CAST(sjr.rate AS FLOAT)) AS average 
      FROM wb_sub_record sr 
      INNER JOIN wb_record r ON sr.recordID=r.recordID 
      INNER JOIN wb_question q ON sr.questionID=q.questionID
      INNER JOIN wb_question_type qt ON q.questionTypeID=qt.questionTypeID
      INNER JOIN wb_subjective_rating sjr ON sr.subjectiveRatingID=sjr.subjectiveRatingID
      WHERE r.userID=:userID and r.isCompleted=1 AND r.recordID=:recordID  GROUP BY r.recordID,qt.name)A
      GROUP BY name`;

          sequelize
                  .query(querystring, {
                      replacements: {userID:userID,recordID:recordID},
                      type: sequelize.QueryTypes.SELECT
                  })
                  .then(wb_question => {
                    res.send({
                      status: 200,
                      data: wb_question,
                      message:
                        "Wellbeing Details found successfully"
                    });
                  })
                  .catch(err => next(err));
    }catch(e){
      next(e)
    }
}

exports.getWellbeingDetailsAvgOfSumByDateRange= async(req,res,next) =>{
  try{
    let {userID, to, from} = req.query;
      let querystring = `SELECT name,CAST(AVG([sum] ) AS decimal(10,3))AS averageOfSum 
      FROM (SELECT r.recordID,qt.name,SUM(CAST(sjr.rate AS FLOAT)) AS [sum] 
      FROM wb_sub_record sr 
      INNER JOIN wb_record r ON sr.recordID=r.recordID 
      INNER JOIN wb_question q ON sr.questionID=q.questionID
      INNER JOIN wb_question_type qt ON q.questionTypeID=qt.questionTypeID
      INNER JOIN wb_subjective_rating sjr ON sr.subjectiveRatingID=sjr.subjectiveRatingID
      WHERE r.userID=:userID and r.isCompleted=1 AND r.createdAt BETWEEN CAST(:from AS DATETIME) AND CAST(:to AS DATETIME)  
      GROUP BY r.recordID,qt.name)A
      GROUP BY name`;

          sequelize
                  .query(querystring, {
                      replacements: {userID:userID,from:from,to:to},
                      type: sequelize.QueryTypes.SELECT
                  })
                  .then(data => {
                    res.send({
                      status: 200,
                      data: data,
                      message:
                        "Wellbeing Details of sum of avg found successfully"
                    });
                  })
                  .catch(err => next(err));
    }catch(e){
      next(e)
    }
}

exports.addNotes= async (req, res, next) => {
  try {
    var userID=req.body.userID;
    let record = {
        notes:req.body.notes,
        lastUpdatedUserID:Number(userID),
    }
    
      
      console.log(record);
      models.wb_record.update(record,{
        where:{recordID:req.body.recordID,userID}
      })
          .then(update => {
            if(update == 1)
            {
              res.send({
                status: 200,
                message: "Notes Added!"
            })
            }
            else{
          
              res.send({
                  status: 500,
                  message: "Cannot update the Notes!"
              })
          }
             
              
          })
          .catch(err => {
              res.send({
                  status: 400,
                  message: "Error occured while adding Notes!"
              })
              console.log("Req, ", err );
          })
  }
  catch (e) {
      next(e);
  }

}