'use strict';

var _ = require('lodash');
var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

var credentials = {
    accessKeyId: process.env.DB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
    region: 'eu-west-1'
};

var dynasty = require('dynasty')(credentials);

function MegaMillionsDbHelper() {}
  
var lottoDbTable = function() {
    return dynasty.table(LOTTO_DATA_TABLE_NAME);
};

MegaMillionsDbHelper.prototype.readLotteryNumbers = function(userId) {
  return lottoDbTable().find(userId).then(function(result) {
    if(result)
      return result.megaMillions;
    else
      return null;
  });
};

MegaMillionsDbHelper.prototype.updateLotteryNumbers = function(userId, lottoNumbersValue) {
  return lottoDbTable().update(userId,{ megaMillions: lottoNumbersValue}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      megaMillions: lottoNumbersValue
    });
  });
};

MegaMillionsDbHelper.prototype.removeLotteryNumbers = function(userId) {
  return lottoDbTable().update(userId,{ megaMillions: []}).catch(function(error) {
    return lottoDbTable().insert({
      echoUserId: userId,
      megaMillions: []
    });
  });
};

module.exports = MegaMillionsDbHelper;