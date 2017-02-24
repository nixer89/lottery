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

Spiel77ApiHelper.prototype.getZusatzNumbers = function(lotteryName) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json)
            return json.last.spiel77.split("");
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
        if(json && json.last.odds && json.last.odds['rank'+myRank]) {
            if(json.last.odds['rank'+myRank].prize > 0) {
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

Spiel77ApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= spiel77Odds.length; i++)
    {
        if(germanOdds['rank'+i][0] == myRank[0] && germanOdds['rank'+i][1] == myRank[1])
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
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/> ";

  return speakOutput;
};

Spiel77ApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung 6 aus 49 von " + date + "  hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung 6 aus 49 von " + date + "  hast du den JackPott geknackt! Alle Zahlen und auch die Superzahl hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            break;
        default:
            speechOutput += "In der letzten Ziehung 6 aus 49 von " + date + "  hast du " + germanOdds['rank'+myRank][0] + " richtige Zahlen" + (germanOdds['rank'+myRank][1] == 1 ? " und sogar die Superzahl richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
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

module.exports = Spiel77ApiHelper;