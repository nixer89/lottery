'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function AustrianLotteryDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

AustrianLotteryDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    if(result)
      return result.austrian6aus45;
    else
      return null;
  });
};

AustrianLotteryDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{ austrian6aus45: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      austrian6aus45: lottoNumbersValue
    });
  });
};

AustrianLotteryDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ austrian6aus45: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      austrian6aus45: []
    });
  });
};

module.exports = AustrianLotteryDbHelper;