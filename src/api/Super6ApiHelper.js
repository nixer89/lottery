'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/german6aus49";
var super6Odds = {"rank1": [6,0], "rank2": [5,0], "rank3": [4,0], "rank4": [3,0], "rank5": [2,0], "rank6": [1,0]};

function Super6ApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            numbersAndDate[0] = stringifyArray(json.last.super6.split(""));
            numbersAndDate[1] = -1;
            numbersAndDate[2] = lotteryDateString;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.super6.split(""));
            numbers[1] = "-1";

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getNextLotteryDrawingDate = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.date.dayOfWeek + ", den " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year + " um " + json.next.date.hour + ":" + json.next.date.minute + " Uhr.";
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.super6Odds && json.last.super6Odds['rank'+myRank]) {
            if(json.last.super6Odds['rank'+myRank].prize > 0) {
                var price = json.last.super6Odds['rank'+myRank].prize + "";
                return price.substring(0, price.length-2) + "," + price.substring(price.length-2);
            } else {
                return null;
            }
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Super6ApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(super6Odds).length; i++)
    {
        if(super6Odds['rank'+i][0] == myRank[0] && super6Odds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

Super6ApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

Super6ApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";

  return speakOutput;
};

Super6ApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung Super6 von " + date + "  hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung Super6 von " + date + "  stimmen alle deine Zahlen überein!. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += "In der letzten Ziehung Super6 von " + date + "  stimmen die letzten " + super6Odds['rank'+myRank][0] + " Zahlen überein. Herzlichen Glückwunsch! " + moneySpeech;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = Super6ApiHelper;