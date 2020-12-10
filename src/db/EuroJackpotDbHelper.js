'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: "eu-west-1"});
const dynamoDb = new AWS.DynamoDB.DocumentClient();

var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

function EuroJackpotDbHelper() {}
  
EuroJackpotDbHelper.prototype.readLotteryNumbers = (echoUserId) => {
  return new Promise((resolve, reject) => {
    const params = {
        TableName: LOTTO_DATA_TABLE_NAME,
        KeyConditionExpression: "#echoUserId = :echoUserId",
        ExpressionAttributeNames: {
            "#echoUserId": "echoUserId"
        },
        ExpressionAttributeValues: {
            ":echoUserId": echoUserId
        }
    }
    dynamoDb.query(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            return reject(JSON.stringify(err, null, 2))
        } 
        console.log("GetItem succeeded:", JSON.stringify(data.Items[0], null, 2));

        if(data.Items[0])
          resolve(data.Items[0].euroJackpot);
        else
          resolve(null);
    })
  });
};

EuroJackpotDbHelper.prototype.updateLotteryNumbers = (echoUserId, lottoNumbersValue) => {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: LOTTO_DATA_TABLE_NAME,
      Key: {
        'echoUserId' : echoUserId
      },
      UpdateExpression: 'set euroJackpot = :t',
      ExpressionAttributeValues: {
        ':t' : lottoNumbersValue
      }
    };

    dynamoDb.update(params, (err, data) => {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          const params = {
            TableName: tableName,
            Item: {
              'echoUserId' : echoUserId,
              'euroJackpot': lottoNumbersValue
            }
          };
          dynamoDb.put(params, (err, data) => {
              if (err) {
                  console.log("Unable to insert =>", JSON.stringify(err))
                  return reject("Unable to insert");
              }
              console.log("Saved Data, ", JSON.stringify(data));
              resolve(data);
          });
      } 
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      resolve(data)
    });
  });
};

module.exports = EuroJackpotDbHelper;