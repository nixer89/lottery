'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/german6aus49";
var germanOdds = {"rank1": [6,1], "rank2": [6,0], "rank3": [5,1], "rank4": [5,0], "rank5": [4,1], "rank6": [4,0], "rank7": [3,1], "rank8": [3,0], "rank9": [2,1]};

function GermanLotteryApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.superzahl));
            numbersAndDate[2] = lotteryDateString;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.numbers);
            numbers[1] = stringifyArray(Array(1).fill(json.last.superzahl));

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.odds['rank'+myRank]) {
            if(json.last.odds['rank'+myRank] > 0) {
                var price = json.last.odds['rank'+myRank].prize + "";
                return price.substring(0, price.length-2) + "," + price.substring(price.length-2);
            } else {
                return null;
            }
        }
    }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= 9; i++)
    {
        if(germanOdds['rank'+i][0] == myRank[0] && germanOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

GermanLotteryApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

GermanLotteryApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/> ";
  
  speakOutput+=". Superzahl:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";

  return speakOutput;
};

GermanLotteryApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung von 6 aus 49 hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung hast du den JackPott geknackt! Alle Zahlen und auch die Superzahl hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += "In der letzten Ziehung hast du " + germanOdds['rank'+myRank][0] + " richtige Zahlen" + (germanOdds['rank'+myRank][1] == 1 ? " und sogar die Superzahl richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
    }

    speechOutput += "<break time=\"200ms\"/>Alle Angaben wie immer ohne Gewähr.</speak>";

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = GermanLotteryApiHelper;