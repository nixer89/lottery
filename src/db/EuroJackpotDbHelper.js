'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

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
  return lottoDbTable().update(userId,{euroJackpot: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      euroJackpot: []
    });
  });
};

module.exports = EuroJackpotDbHelper;