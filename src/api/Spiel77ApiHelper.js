'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/german6aus49";
var spiel77Odds = {"rank1": [7,0], "rank2": [6,0], "rank3": [5,0], "rank4": [4,0], "rank5": [3,0], "rank6": [2,0], "rank7": [1,0]};

function Spiel77ApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            numbersAndDate[0] = stringifyArray(json.last.spiel77.split(""));
            numbersAndDate[1] = -1;
            numbersAndDate[2] = lotteryDateString;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.spiel77.split(""));
            numbers[1] = "-1";

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getNextLotteryDrawingDate = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.date.dayOfWeek + ", den " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year + " um " + json.next.date.hour + " Uhr "  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "");
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.spiel77Odds && json.last.spiel77Odds['rank'+myRank]) {
            if(json.last.spiel77Odds['rank'+myRank].prize > 0) {
                var price = json.last.spiel77Odds['rank'+myRank].prize + "";
                return price.substring(0, price.length-2) + "," + price.substring(price.length-2);
            } else {
                return null;
            }
        }
    }).catch(function(err) {
        console.log(err);
    });
};

Spiel77ApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    
    for(var i = 1; i <= Object.keys(spiel77Odds).length; i++)
    {
        if(spiel77Odds['rank'+i][0] == myRank[0] && spiel77Odds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

Spiel77ApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

Spiel77ApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";

  return speakOutput;
};

Spiel77ApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung Spiel77 von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung Spiel77 von " + date + " stimmen alle deine Zahlen überein!. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        case 7:
            speechOutput += "In der letzten Ziehung Super6 von " + date + " stimmt die letzte Zahl überein. Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += "In der letzten Ziehung Spiel77 von " + date + " stimmen die letzten " + spiel77Odds['rank'+myRank][0] + " Zahlen überein. Herzlichen Glückwunsch! " + moneySpeech;
    }

    return speechOutput;
};

Spiel77ApiHelper.prototype.createLotteryWinSpeechOutputShort = function(myRank, moneySpeech, date) {
    var speechOutput = "<break time=\"500ms\"/>";

    switch(myRank) {
        case 1000:
            speechOutput += " In Spiel77 hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += " In Spiel77 stimmen alle deine Zahlen überein!. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        case 7:
            speechOutput += " In Spiel77 stimmt die letzte Zahl überein. Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += " In Spiel77 stimmen die letzten " + spiel77Odds['rank'+myRank][0] + " Zahlen überein. Herzlichen Glückwunsch! " + moneySpeech;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = Spiel77ApiHelper;