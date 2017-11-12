'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/austriaLotto";
var austrianOdds = {"rank1": [6,0], "rank2": [5,1], "rank3": [5,0], "rank4": [4,1], "rank5": [4,0], "rank6": [3,1], "rank7": [3,0], "rank8": [0,1]};
var locale="";

function AustrianLotteryApiHelper(currentLocale) {
    locale = currentLocale;

    if(!isGermanLang())
        LOTTOLAND_API_URL = "https://lottoland.com/en/api/drawings/austriaLotto";
    else
        LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/austriaLotto";
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

AustrianLotteryApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            if(isUSLang())
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.month + "." + json.last.date.day + "." + json.last.date.year;
            else
                lotteryDateString = json.last.date.dayOfWeek + ", " + json.last.date.day + "." + json.last.date.month + "." + json.last.date.year;

            numbersAndDate[0] = stringifyArray(json.last.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(json.last.Zusatzzahl[0]));
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = "";//json.last.currency;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianLotteryApiHelper.prototype.getCorrectArticle = function() {
    if(isGermanLang())
        return "Die ";
    else
        return "The ";
}

AustrianLotteryApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = stringifyArray(json.last.numbers);
            numbers[1] = stringifyArray(Array(1).fill(json.last.Zusatzzahl[0]));

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianLotteryApiHelper.prototype.getNextLotteryDrawingDate = function() {
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

AustrianLotteryApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json.next.jackpot;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianLotteryApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json && json.last.odds && json.last.odds['rank'+myRank]) {
            if(json.last.odds['rank'+myRank].prize > 0) {
                var price = json.last.odds['rank'+myRank].prize + "";
                return price.substring(0, price.length-2) + (isGermanLang() ? "," : ".") + price.substring(price.length-2) + " €.";
            } else {
                return null;
            }
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianLotteryApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];

    var rank = 1000;

    //check including zusatzzahl for higher prices first
    for(var i = 1; i <= Object.keys(austrianOdds).length; i++)
    {
        if(austrianOdds['rank'+i][0] == myRank[0] && austrianOdds['rank'+i][1] == myRank[1])
            rank = i;
    }
    console.log("rank including zusatzzahl: " + rank);

    //no matches with zusatzzahl found -> check without zusatzzahl - coz it is just additionally
    if(rank == 1000) {
        for(var i = 1; i <= Object.keys(austrianOdds).length; i++)
        {
            if(austrianOdds['rank'+i][0] == myRank[0] && austrianOdds['rank'+i][1] == 0)
                rank = i;
        }
    }

    return rank;
};

AustrianLotteryApiHelper.prototype.createSSMLOutputForNumbers = function(numbers) {
    var speakOutput = "";
    var mainNumbers = numbers[0];
    var addNumbers = numbers[1];

    for(var i = 0; i < mainNumbers.length; i++)
        speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";
    
    if(addNumbers[0]) {
        if(isGermanLang())
            speakOutput+=". Zusatzzahl:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";
        else
            speakOutput+=". bonus number:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";
    }
    
    return speakOutput;
};

AustrianLotteryApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case 1000:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung 6 aus 45 von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "The last drawing of austrian lotto was on " + date + ". Unfortunately, you didn`t won anything. I wish you all the luck in the future!";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung 6 aus 45 von " + date + " hast du den Jackpot geknackt! Alle Zahlen hast du richtig vorhergesagt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of austrian lotto was on " + date + ". And you won the jackpot! You predicted all numbers correctly! Let´s get the party started! Congratulation! " + moneySpeech ;
            break;
        case 8:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung 6 aus 45 von " + date + " hast du die Zusatzzahl richtig! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of austrian lotto was on " + date + ". You have the correct bonus number! Congratulation! " + moneySpeech ;
            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung 6 aus 45 von " + date + " hast du " + austrianOdds['rank'+myRank][0] + " richtige Zahlen" + (austrianOdds['rank'+myRank][1] == 1 ? " und sogar die Zusatzzahl richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of austrian lotto was on " + date + ". You have " + austrianOdds['rank'+myRank][0] + " matching numbers" + (austrianOdds['rank'+myRank][1] == 1 ? " and the bonus number does match as well!" : "!") + " Congratulation! " + moneySpeech;
    }

    return speechOutput;
};

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = AustrianLotteryApiHelper;