'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/megaMillions";
var megaMillionsOdds = {"rank1": [5,1], "rank2": [5,0], "rank3": [4,1], "rank4": [4,0], "rank5": [3,1], "rank6": [3,0], "rank7": [2,1], "rank8": [1,1], "rank9": [0,1]};
var megaMillionsPrizes = {"rank1": 0 , "rank2": 100000000, "rank3": 500000, "rank4": 50000, "rank5": 5000, "rank6": 500, "rank7": 500, "rank8": 200, "rank9": 100};
var locale="";

function MegaMillionsApiHelper(currentLocale) {
    locale = currentLocale;

    if(!isGermanLang())
        LOTTOLAND_API_URL = "https://lottoland.com/en/api/drawings/megaMillions";
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

function isUSLang() {
    return 'en-US' == locale;
}

MegaMillionsApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            if(isUSLang())
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.month + "." + json.last.date.day + "." + json.last.date.year;
            else
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;

            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.megaballs));
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = "";//json.last.currency;
            numbersAndDate[4] = "megaplier";
            numbersAndDate[5] = json.last.megaplier;

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
            numbers[2] = "megaplier";
            numbers[3] = json.last.megaplier;

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getCorrectArticle = function() {
    if(isGermanLang())
        return "Der ";
    else
        return "The ";
}

MegaMillionsApiHelper.prototype.getNextLotteryDrawingDate = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            if(isGermanLang())
                return json.next.date.dayOfWeek + ", den " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year; // + " um " + json.next.date.hour + " Uhr "  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "");
            else if(isUSLang())
                return json.next.date.dayOfWeek + ", " + json.next.date.month + "." + json.next.date.day + "." + json.next.date.year; // + " at " + json.next.date.hour + ":"  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "00");
            else
                return json.next.date.dayOfWeek + ", " + json.next.date.day + "." + json.next.date.month + "." + json.next.date.year; // + " at " + json.next.date.hour + ":"  + (Number(json.next.date.minute) > 0 ? json.next.date.minute : "00");
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            //return json.next.jackpot;
            if(isGermanLang())
                return "Der aktuelle Jackpot kann nicht bestimmt werden.";
            else
                return "The current jackpot cannot be determined";
        }
    }).catch(function(err) {
        console.log(err);
    });
};

MegaMillionsApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json) {
            if(isGermanLang() && json.last.odds && json.last.odds['rank'+myRank] && json.last.odds['rank'+myRank].prize > 0) {
                return formatPrize(json.last.odds['rank'+myRank].prize, json.last.megaplier, myRank);
            } else if(!isGermanLang() && megaMillionsPrizes['rank'+myRank] && megaMillionsPrizes['rank'+myRank].prize > 0){ //no odds yet -> check if rank is in known prize
                return formatPrize(megaMillionsPrizes['rank'+myRank], json.last.megaplier, myRank);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

function formatPrize(prize, megaplier, myRank) {
    var output = ""
    var prizeNoMegaPlier = prize+"";

    output += prizeNoMegaPlier.substring(0, prizeNoMegaPlier.length-2) + (isGermanLang() ? "," : ".") + prizeNoMegaPlier.substring(prizeNoMegaPlier.length-2);
    var multiplikator = myRank == 1 ? 0 : megaplier;

    if(multiplikator > 0) {
        if(isGermanLang())
            output += " €. Wenn du zusätzlich noch MegaPlier aktiviert hast, beträgt dein Gewinn ";
        else
            output += " $. If you additionally activated MegaPlier, the amount you won is: ";

        var prizeX = myRank == 1 ? 0 : (prize * multiplikator);
        output += prizeX.substring(0, prizeX.length-2) + (isGermanLang() ? "," : ".") + prizeX.substring(prizeX.length-2); + (isGermanLang() ? " €." : " $.");
    }

    return output;
}

MegaMillionsApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(megaMillionsOdds).length; i++)
    {
        if(megaMillionsOdds['rank'+i][0] == myRank[0] && megaMillionsOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

MegaMillionsApiHelper.prototype.createSSMLOutputForNumbers = function(numbers) {
    var speakOutput = "";
    var mainNumbers = numbers[0];
    var addNumbers = numbers[1];

    for(var i = 0; i < mainNumbers.length; i++)
        speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";

    speakOutput+=". Megaball:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";

    if(numbers[4] && numbers[5])
    speakOutput += numbers[4] + (isGermanLang() ? " ist " : " is ") + numbers[5] + ".<break time=\"500ms\"/>";
    
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
                speechOutput += "In der letzten Ziehung MegaMillions von " + date + " hast du den Jackpot geknackt! Alle Zahlen und auch den Megaball hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! ";
            else
                speechOutput += "The last drawing of megamillions was on " + date + ". And you won the jackpot! You predicted all numbers and the megaball correctly! Let´s get the party started! Congratulation! ";
            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung MegaMillions von " + date + " hast du " + megaMillionsOdds['rank'+myRank][0] + " richtige Zahlen" + (megaMillionsOdds['rank'+myRank][1] == 1 ? " und sogar den Megaball richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of megamillions was on " + date + ". You have " + megaMillionsOdds['rank'+myRank][0] + " matching numbers" + (megaMillionsOdds['rank'+myRank][1] == 1 ? " and the megaball does match as well!" : "!") + " Congratulation! " + moneySpeech;
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