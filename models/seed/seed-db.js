"use strict";

const models = require("../db");

const _User = require("./mockUser.json");
const _LOGIN_TYPE = require('./mockLogin.json');
const _COUNTRIES = require('./mockCountries.json');
const _STATE = require('./mockState.json');
const _CITY = require('./mockCities.json');



const _WB_SUBJECTIVE_RATING=require('./mockWBSubjectiveRating.json')
const _WB_QUESTION_TYPE=require('./mockWbQuestionType.json');
const _WB_QUESTION=require('./mockWbQuestion.json');


module.exports = {
    insert: async () => {

       

       await models.user_login_type.bulkCreate(_LOGIN_TYPE);
       await models.users.bulkCreate(_User);
       await models.countries.bulkCreate(_COUNTRIES);
       await models.state.bulkCreate(_STATE);
       await models.cities.bulkCreate(_CITY);

       await models.meals.bulkCreate(_MEALS);
       await models.mealType.bulkCreate(_MEAL_TYPE);
       await models.mealTaken.bulkCreate(_MEAL_TAKEN);
       await models.mealTakenDetails.bulkCreate(_MEAL_TAKEN_DETAILS);

       await models.waterSettings.bulkCreate(_WATER_SETTINGS);

       await models.wb_question_type.bulkCreate(_WB_QUESTION_TYPE);
       await models.wb_question.bulkCreate(_WB_QUESTION);
       await models.wb_subjective_rating.bulkCreate(_WB_SUBJECTIVE_RATING);
       


       await models.hrt_current_status.bulkCreate(_HRT_CURRENT_STATUS);
        console.log("Reference Data Inserted Successfully");
    }
};