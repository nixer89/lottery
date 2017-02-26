'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function Spiel77DbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

Spiel77DbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    if(result && result.spiel77)
      return convertTippscheinnummern(result.spiel77);
    else
      return [];
  });
};

Spiel77DbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  for(var i = 0; i < lottoNumbersValue.length; i++)
    for(var j = 0; j < lottoNumbersValue[i].length; j++) {
      lottoNumbersValue[i][0] = [lottoNumbersValue[i][0].join("")];
      lottoNumbersValue[i][1] = ["-1"];
    }

  return lottoDbTable().update(userId,{ spiel77: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      spiel77: lottoNumbersValue
    });
  });
};

Spiel77DbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ spiel77: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      spiel77: []
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

module.exports = Spiel77DbHelper;