'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/powerBall";
var powerBallOdds = {"rank1": [5,1], "rank2": [5,0], "rank3": [4,1], "rank4": [4,0], "rank5": [3,1], "rank6": [3,0], "rank7": [2,1], "rank8": [1,1], "rank9": [0,1]};
var powerBallPrizes = {"rank1": 0, "rank2": 1000000, "rank3": 50000, "rank4": 100, "rank5": 100, "rank6": 7, "rank7": 7, "rank8": 4, "rank9": 4};
var locale="";

function PowerBallApiHelper(currentLocale) {
    locale = currentLocale;

    if(!isGermanLang())
        LOTTOLAND_API_URL = "https://lottoland.com/en/api/drawings/powerBall";
}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

function isGermanLang() {
    return 'de-DE' == locale;
}

PowerBallApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            if(isGermanLang())
                lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            else
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;

            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.powerballs));
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = json.last.currency;

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
            if(isGermanLang())
                return json.next.date.dayOfWeek + ", den " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year + " um " + json.next.date.hour + " Uhr "  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "");
            else
                return json.next.date.dayOfWeek + ", " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year + " at " + json.next.date.hour + ":"  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "00");
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
                var price = powerBallPrizes['rank'+myRank];
                var output = ""
                var priceNoPowerPlay = price;

                output += priceNoPowerPlay;

                var multiplikator = myRank == 1 ? 0 : (myRank == 2 ? 2 : json.last.powerplay);

                if(multiplikator > 0) {
                    if(isGermanLang())
                        output += " $. Wenn du zusätzlich noch PowerPlay aktiviert hast, beträgt dein Gewinn ";
                    else
                        output += " $. If you additionally activated PowerPlay, the amount you won is: ";

                    var priceX = (price * multiplikator) + "";
                    output += priceX + " $."
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
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Powerball von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "The last drawing of powerball was on " + date + ". Unfortunately, you didn`t won anything. I wish you all the luck in the future!";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Powerball von " + date + " hast du den JackPott geknackt! Alle Zahlen und auch den Powerball hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of powerball was on " + date + ". And you won the jackpot! You predicted all numbers and the powerball correctly! Let´s get the party started! Congratulation! " + moneySpeech ;

            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Powerball von " + date + " hast du " + powerBallOdds['rank'+myRank][0] + " richtige Zahlen" + (powerBallOdds['rank'+myRank][1] == 1 ? " und sogar den Powerball richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of powerball was on " + date + ". You have " + germanOdds['rank'+myRank][0] + " matching numbers" + (germanOdds['rank'+myRank][1] == 1 ? " and the powerball does match as well!" : "!") + " Congratulation! " + moneySpeech;
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