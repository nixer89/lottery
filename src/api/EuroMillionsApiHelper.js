'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/euroMillions";
var euroMillionsOdds = {"rank1": [5,2], "rank2": [5,1], "rank3": [5,0], "rank4": [4,2], "rank5": [4,1], "rank6": [3,2], "rank7": [4,0], "rank8": [2,2], "rank9": [3,1], "rank10": [3,0], "rank11": [1,2], "rank12": [2,1], "rank13": [2,0]};
var locale="";

function EuroMillionsApiHelper(currentLocale) {
    locale = currentLocale;

    if(!isGermanLang())
        LOTTOLAND_API_URL = "https://lottoland.com/en/api/drawings/euroMillions";
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

EuroMillionsApiHelper.prototype.getLastLotteryDateAndNumbers =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            if(isGermanLang())
                lotteryDateString = json.last.date.dayOfWeek + ", den " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;
            else
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;

            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(json.last.stars);
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = json.last.currency;

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

EuroMillionsApiHelper.prototype.getNextLotteryDrawingDate = function() {
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

EuroMillionsApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
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
                return price.substring(0, price.length-2) + (isGermanLang() ? "," : ".") + price.substring(price.length-2);
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

    for(var i = 1; i <= Object.keys(euroMillionsOdds).length; i++)
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
        speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";
    
    if(isGermanLang())
        speakOutput+=". Sterne: <break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/> und " + addNumbers[1] + "<break time=\"500ms\"/>";
    else
        speakOutput+=". Stars: <break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/> und " + addNumbers[1] + "<break time=\"500ms\"/>";
        
    return speakOutput;
};

EuroMillionsApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "The last drawing of euro millions was on " + date + ". Unfortunately, you didn`t won anything. I wish you all the luck in the future!";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du den JackPott geknackt! Alle Zahlen und auch die beiden Sterne hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech ;
            else
                speechOutput += "The last drawing of euro millions was on " + date + ". And you won the jackpot! You predicted all numbers and both stars correctly! Let´s get the party started! Congratulation! " + moneySpeech ;
            break;
        default:
            if(isGermanLang()) {
                speechOutput += "In der letzten Ziehung Euromillions von " + date + " hast du ";
                speechOutput += euroMillionsOdds['rank'+myRank][0] == 1 ? "eine richtige Zahl" : euroMillionsOdds['rank'+myRank][0] + " richtige Zahlen";
                speechOutput += (euroMillionsOdds['rank'+myRank][1] == 1 ? " und einen Stern richtig!" : "");
                speechOutput += (euroMillionsOdds['rank'+myRank][1] == 2 ? " und zwei Sterne richtig!" : "");
                speechOutput += "! Herzlichen Glückwunsch! " + moneySpeech;
            } else {
                speechOutput += "The last drawing of euro millions was on " + date + ". You have ";
                speechOutput += euroJackpotOdds['rank'+myRank][0] == 1 ? "one matching number" : euroJackpotOdds['rank'+myRank][0] + " matching numbers";
                speechOutput += (euroJackpotOdds['rank'+myRank][1] == 1 ? " and one matching stars!" : "");
                speechOutput += (euroJackpotOdds['rank'+myRank][1] == 2 ? " and two matching stars!" : "");
                speechOutput += "! Congratulation! " + moneySpeech;
            }
            break;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = EuroMillionsApiHelper;