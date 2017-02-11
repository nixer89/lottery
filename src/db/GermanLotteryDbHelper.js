'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = 'lotteryNumbers';

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function GermanLotteryDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

GermanLotteryDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    return result.german6aus49;
  });
};

GermanLotteryDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{ german6aus49: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      german6aus49: lottoNumbersValue
    });
  });
};

GermanLotteryDbHelper.prototype.removeLottoNumbers = function(userId) {
  return lottoDbTable().remove(userId, {range: german6aus49}).then(function(result) {
    return result;
  });
};

GermanLotteryDbHelper.prototype.createSSMLOutputForField = function(field) {
  var speakOutput = "";
  var mainNumbers = field[0];
  var addNumbers = field[1];

  for(var i = 0; i <= mainNumbers.length; i++)
      speakOutput+=mainNumbers[i] + "<break time=\"500ms\"/> ";
  
  speakOutput+=". Superzahl: " + addNumbers[0] + "<break time=\"500ms\"/>";

  return speakOutput;
};

module.exports = GermanLotteryDbHelper;