'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/megaMillions";
var megaMilltionsOdds = {"rank1": [5,1], "rank2": [5,0], "rank3": [4,1], "rank4": [4,0], "rank5": [3,1], "rank6": [3,0], "rank7": [2,1], "rank8": [1,1], "rank9": [0,1]};
var locale="";

function MegaMillionsApiHelper(currentLocale) {
    locale = currentLocale;
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

MegaMillionsApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            if(isGermanLang())
                lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            else
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;

            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.megaballs));
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = json.last.currency;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.numbers);
            numbers[1] = stringifyArray(Array(1).fill(json.last.megaballs));

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getNextLotteryDrawingDate = function() {
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

MegaMillionsApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.odds && json.last.odds['rank'+myRank]) {
            if(json.last.odds['rank'+myRank].prize > 0) {
                var price = json.last.odds['rank'+myRank].prize + "";
                var output = ""
                var priceNoPowerPlay = price.substring(0, price.length-2) + "," + price.substring(price.length-2);

                output += priceNoPowerPlay;
                var multiplikator = myRank == 1 ? 0 : json.last.megaplier;

                if(multiplikator > 0) {
                    output += " Euro. Wenn du zusätzlich noch MegaPlier aktiviert hast, beträgt dein Gewinn ";
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

MegaMillionsApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(megaMilltionsOdds).length; i++)
    {
        if(megaMilltionsOdds['rank'+i][0] == myRank[0] && megaMilltionsOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

MegaMillionsApiHelper.prototype.createSSMLOutputForField = function(field) {
  return this.createSSMLOutputForNumbers(field[0], field[1]);
};

MegaMillionsApiHelper.prototype.createSSMLOutputForNumbers = function(mainNumbers, addNumbers) {
    var speakOutput = "";
    for(var i = 0; i < mainNumbers.length; i++)
        speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";

    speakOutput+=". Megaball:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";
    
    return speakOutput;
};

MegaMillionsApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung MegaMillions von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "The last drawing of megamillions was on " + date + ". Unfortunately, you didn`t won anything. I wish you all the luck in the future!";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung MegaMillions von " + date + " hast du den JackPott geknackt! Alle Zahlen und auch den Megaball hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of megamillions was on " + date + ". And you won the jackpot! You predicted all numbers and the megaball correctly! Let´s get the party started! Congratulation! " + moneySpeech ;
            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung MegaMillions von " + date + " hast du " + megaMilltionsOdds['rank'+myRank][0] + " richtige Zahlen" + (megaMilltionsOdds['rank'+myRank][1] == 1 ? " und sogar den Megaball richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of megamillions was on " + date + ". You have " + germanOdds['rank'+myRank][0] + " matching numbers" + (germanOdds['rank'+myRank][1] == 1 ? " and the megaball does match as well!" : "!") + " Congratulation! " + moneySpeech;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = MegaMillionsApiHelper;