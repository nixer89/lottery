'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/euroMillions";
var euroMillionsOdds = {"rank1": [5,2], "rank2": [5,1], "rank3": [5,0], "rank4": [4,2], "rank5": [4,1], "rank6": [3,2], "rank7": [4,0], "rank8": [2,2], "rank9": [3,1], "rank10": [3,0], "rank11": [1,2], "rank12": [2,1], "rank13": [2,0]};

function EuroMillionsApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

EuroMillionsApiHelper.prototype.getLastLotteryDateAndNumbers =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(json.last.stars);
            numbersAndDate[2] = lotteryDateString;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

EuroMillionsApiHelper.prototype.getLastLotteryNumbers =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.numbers);
            numbers[1] = stringifyArray(json.last.stars);
            
            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

EuroMillionsApiHelper.prototype.getLastPrizeByRank = function(myRank) {
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

EuroMillionsApiHelper.prototype.getOdds = function() {
    return euroMillionsOdds;
};

EuroMillionsApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];

    for(var i = 1; i <= 12; i++)
    {
        if(euroMillionsOdds['rank'+i][0] == myRank[0] && euroMillionsOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

EuroMillionsApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

EuroMillionsApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
  var speakOutput = "";

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/> ";
  
  speakOutput+=". Sterne: <break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/> und " + addNumbers[1] + "<break time=\"500ms\"/>";

  console.log("generated output: " + speakOutput);

  return speakOutput;
};

EuroMillionsApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            break;
        case 1:
            speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du den JackPott geknackt! Alle Zahlen und auch die beiden Sterne hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech ;
            break;
        default:
            speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du ";
            speechOutput += euroMillionsOdds['rank'+myRank][0] == 1 ? "eine richtige Zahl" : euroMillionsOdds['rank'+myRank][0] + " richtige Zahlen";
            speechOutput += (euroMillionsOdds['rank'+myRank][1] == 1 ? " und einen Stern richtig!" : "");
            speechOutput += (euroMillionsOdds['rank'+myRank][1] == 2 ? " und zwei Sterne richtig!" : "");
            speechOutput += "! Herzlichen Glückwunsch! " + moneySpeech;
            break;
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

module.exports = EuroMillionsApiHelper;