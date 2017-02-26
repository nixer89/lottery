'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/powerBall";
var powerBallOdds = {"rank1": [5,1], "rank2": [5,0], "rank3": [4,1], "rank4": [4,0], "rank5": [3,1], "rank6": [3,0], "rank7": [2,1], "rank8": [1,1], "rank9": [0,1]};

function PowerBallApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.powerballs));
            numbersAndDate[2] = lotteryDateString;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.numbers);
            numbers[1] = stringifyArray(Array(1).fill(json.last.powerballs));

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getNextLotteryDrawingDate = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.date.dayOfWeek + ", den " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year + " um " + json.next.date.hour + ":" + json.next.date.minute + " Uhr.";
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.odds && json.last.odds['rank'+myRank]) {
            if(json.last.odds['rank'+myRank].prize > 0) {
                var price = json.last.odds['rank'+myRank].prize + "";
                var output = ""
                var priceNoPowerPlay = price.substring(0, price.length-2) + "," + price.substring(price.length-2);

                output += priceNoPowerPlay;

                var multiplikator = myRank == 1 ? 0 : (myRank == 2 ? 2 : json.last.powerplay);

                if(multiplikator > 0) {
                    output += " Euro. Wenn du zusätzlich noch PowerPlay aktiviert hast, beträgt dein Gewinn ";
                    var priceX = (price * multiplikator) + "";
                    output += priceX.substring(0, priceX.length-2) + "," + priceX.substring(priceX.length-2);
                }

                return output;
            } else {
                return null;
            }
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(powerBallOdds).length; i++)
    {
        if(powerBallOdds['rank'+i][0] == myRank[0] && powerBallOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

PowerBallApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

PowerBallApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";
  
  speakOutput+=". Powerball:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";

  return speakOutput;
};

PowerBallApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung Powerball von " + date + "  hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung Powerball von " + date + "  hast du den JackPott geknackt! Alle Zahlen und auch den Powerball hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += "In der letzten Ziehung Powerball von " + date + "  hast du " + powerBallOdds['rank'+myRank][0] + " richtige Zahlen" + (powerBallOdds['rank'+myRank][1] == 1 ? " und sogar den Powerball richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = PowerBallApiHelper;