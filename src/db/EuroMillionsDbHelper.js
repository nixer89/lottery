'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function EuroMillionsDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

EuroMillionsDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    return result.euroMillions;
  });
};

EuroMillionsDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{euroMillions: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      euroMillions: lottoNumbersValue
    });
  });
};

EuroMillionsDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{euroMillions: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      euroMillions: []
    });
  });
};

module.exports = EuroMillionsDbHelper;