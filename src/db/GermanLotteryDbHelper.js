'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

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

GermanLotteryDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ german6aus49: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      german6aus49: []
    });
  });
};

module.exports = GermanLotteryDbHelper;