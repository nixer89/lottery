'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function PowerBallDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

PowerBallDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    return result.powerBall;
  });
};

PowerBallDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{ powerBall: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      powerBall: lottoNumbersValue
    });
  });
};

PowerBallDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ powerBall: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      powerBall: []
    });
  });
};

module.exports = PowerBallDbHelper;