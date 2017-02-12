'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = 'lotteryNumbers';

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function EuroJackpotDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

EuroJackpotDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    return result.euroJackpot;
  });
};

EuroJackpotDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{euroJackpot: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      euroJackpot: lottoNumbersValue
    });
  });
};

EuroJackpotDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().remove(userId, {range: euroJackpot}).then(function(result) {
    return result;
  });
};

EuroJackpotDbHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

EuroJackpotDbHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/> ";
  
  speakOutput+=". Eurozahlen: " + addNumbers[0] + "<break time=\"500ms\"/> und " + addNumbers[1] + "<break time=\"500ms\"/>";

  console.log("generated output: " + speakOutput);

  return speakOutput;
};

module.exports = EuroJackpotDbHelper;