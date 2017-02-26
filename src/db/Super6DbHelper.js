'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function Super6DbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

Super6DbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    if(result.super6)
      return convertTippscheinnummern(result.super6);
    else
      return [];
  });
};

Super6DbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  for(var i = 0; i < lottoNumbersValue.length; i++)
    for(var j = 0; j < lottoNumbersValue[i].length; j++) {
      lottoNumbersValue[i][0] = [lottoNumbersValue[i][0].join("")];
      lottoNumbersValue[i][1] = ["-1"];
    }

  return lottoDbTable().update(userId,{ super6: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      super6: lottoNumbersValue
    });
  });
};

Super6DbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ super6: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      super6: []
    });
  });
};

function convertTippscheinnummern(lotteryNumbers) {
    var convertedArray = [];
    for(var i = 0; i < lotteryNumbers.length; i++) {
        convertedArray[i] = convertTippscheinnummernSub(lotteryNumbers[i]);
    }

    return convertedArray;
}

function convertTippscheinnummernSub(lotteryNumbers) {
    var convertedArray = [];
    for(var i = 0; i < lotteryNumbers.length; i++) {

        var tempArray = [];

        //convert string values from db to numbers to sort them later!
        for(var k = 0; k < lotteryNumbers[i].length; k++) {
            tempArray = lotteryNumbers[i][k].split("");
        }

        //set array to index
        convertedArray[i] = tempArray;
    }

    return convertedArray;
}

module.exports = Super6DbHelper;