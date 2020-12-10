'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: "eu-west-1"});
const dynamoDb = new AWS.DynamoDB.DocumentClient();

var LOTTO_DATA_TABLE_NAME = process.env.DB_TABLE;

function Super6DbHelper() {}

Super6DbHelper.prototype.readLotteryNumbers = (echoUserId) => {
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
          resolve(data.Items[0].super6);
        else
          resolve(null);
    })
  });
};

Super6DbHelper.prototype.updateLotteryNumbers = (echoUserId, lottoNumbersValue) => {
  for(var i = 0; i < lottoNumbersValue.length; i++)
    for(var j = 0; j < lottoNumbersValue[i].length; j++) {
      lottoNumbersValue[i][0] = [lottoNumbersValue[i][0].join("")];
      lottoNumbersValue[i][1] = ["-1"];
    }

    return new Promise((resolve, reject) => {
      var params = {
        TableName: LOTTO_DATA_TABLE_NAME,
        Key: {
          'echoUserId' : echoUserId
        },
        UpdateExpression: 'set super6 = :t',
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
                'super6': lottoNumbersValue
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

module.exports = Super6DbHelper;