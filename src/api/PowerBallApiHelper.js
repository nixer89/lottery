'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/powerBall";
var CURRENCY_EXCHANGE_API_URL_EUR = "https://api.fixer.io/latest?base=EUR";
var powerBallOdds = {"rank1": [5,1], "rank2": [5,0], "rank3": [4,1], "rank4": [4,0], "rank5": [3,1], "rank6": [3,0], "rank7": [2,1], "rank8": [1,1], "rank9": [0,1]};
var powerBallPrizes = {"rank1": 0, "rank2": 100000000, "rank3": 5000000, "rank4": 10000, "rank5": 10000, "rank6": 700, "rank7": 700, "rank8": 400, "rank9": 400};
var locale="";

function PowerBallApiHelper(currentLocale) {
    locale = currentLocale;

    if(!isGermanLang())
        LOTTOLAND_API_URL = "https://lottoland.com/en/api/drawings/powerBall";
    else
        LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/powerBall";
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

PowerBallApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbersAndDate = [];
            var lotteryDateString = "";
            var lastLottery = null;
            
            if(json.last.numbers && json.last.numbers.length > 0) {
                lastLottery = json.last;
            } else {
                lastLottery = json.past;
            }
            
            if(isUSLang())
                lotteryDateString = lastLottery.date.dayOfWeek + ", " + lastLottery.date.month + "." + lastLottery.date.day + "." + lastLottery.date.year;
            else
                lotteryDateString = lastLottery.date.dayOfWeek + ", " + lastLottery.date.day + "." + lastLottery.date.month + "." + lastLottery.date.year;

            numbersAndDate[0] = stringifyArray(lastLottery.numbers);
            numbersAndDate[1] = stringifyArray(Array(1).fill(lastLottery.powerballs));
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = "";//json.last.currency;
            numbersAndDate[4] = "powerplay";
            numbersAndDate[5] = lastLottery.powerplay;

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
            var lastLottery = null;
            
            if(json.last.numbers && json.last.numbers.length > 0) {
                lastLottery = json.last;
            } else {
                lastLottery = json.past;
            }

            numbers[0] = stringifyArray(lastLottery.numbers);
            numbers[1] = stringifyArray(Array(1).fill(lastLottery.powerballs));
            numbers[2] = "powerplay";
            numbers[3] = lastLottery.powerplay;

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getCorrectArticle = function() {
    if(isGermanLang())
        return "Der ";
    else
        return "The ";
}

PowerBallApiHelper.prototype.getNextLotteryDrawingDate = function() {
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

PowerBallApiHelper.prototype.getCurrentJackpot =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(jsonJackpot){
        if(jsonJackpot) {
            return invokeBackend(CURRENCY_EXCHANGE_API_URL_EUR).then(function(exchangeRate){
                var currentJackpot = 0;
                if(jsonJackpot.next)
                    currentJackpot = jsonJackpot.next.jackpot;
                else
                    currentJackpot = jsonJackpot.last.jackpot;
                
                if(exchangeRate && exchangeRate.rates.USD) {
                    currentJackpot = Math.round(currentJackpot * exchangeRate.rates.USD);
                }

                if(isGermanLang())
                    return "Der aktuelle Jackpott von PowerBall beträgt etwa " + currentJackpot + " Millionen $.";
                else
                    return "The current jackpot of PowerBall is around  " + currentJackpot + " million $.";
            });
        }
    }).catch(function(err) {
        console.log(err);
    });
};

PowerBallApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json) {
            var lastLottery = null;
            
            if(json.last.numbers && json.last.numbers.length > 0) {
                lastLottery = json.last;
            } else {
                lastLottery = json.past;
            }

            console.log("check for prize");
            if(isGermanLang() && lastLottery.odds && lastLottery.odds['rank'+myRank] && lastLottery.odds['rank'+myRank].prize > 0) {
                console.log("check for prize german");
                return formatPrize(lastLottery.odds['rank'+myRank].prize, lastLottery.powerplay, myRank);
            } else if(!isGermanLang() && powerBallPrizes['rank'+myRank] && powerBallPrizes['rank'+myRank].prize > 0){ //no odds yet -> check if rank is in known prize
                return formatPrize(powerBallPrizes['rank'+myRank], lastLottery.powerplay, myRank);
            } else {
                return null;
            }
        }
        else return null;
    }).catch(function(err) {
        console.log(err);
    });
};

function formatPrize(prize, powerplay, myRank) {
    var output = ""
    var prizeNoPowerPlay = prize+"";

    console.log("prize: " + prize);
    console.log("rank: " + myRank);

    output += prizeNoPowerPlay.substring(0, prizeNoPowerPlay.length-2) + (isGermanLang() ? "," : ".") + prizeNoPowerPlay.substring(prizeNoPowerPlay.length-2);

    var multiplikator = myRank == 1 ? 0 : (myRank == 2 ? 2 : powerplay);

    if(multiplikator > 0) {
        if(isGermanLang())
            output += " €. Wenn du zusätzlich noch PowerPlay aktiviert hast, beträgt dein Gewinn ";
        else
            output += " $. If you additionally activated PowerPlay, the amount you won is: ";

        var prizeX = (prize * multiplikator) + "";
        output += prizeX.substring(0, prizeX.length-2) + (isGermanLang() ? "," : ".") + prizeX.substring(prizeX.length-2) + (isGermanLang() ? " €." : " $.");
    }

    return output;
}

PowerBallApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(powerBallOdds).length; i++)
    {
        if(powerBallOdds['rank'+i][0] == myRank[0] && powerBallOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

PowerBallApiHelper.prototype.createSSMLOutputForNumbers = function(numbers) {
    var speakOutput = "";
    var mainNumbers = numbers[0];
    var addNumbers = numbers[1];
    
    for(var i = 0; i < mainNumbers.length; i++)
        speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";
        
    speakOutput+=". Powerball:<break time=\"200ms\"/>" + addNumbers[0] + "<break time=\"500ms\"/>";

    if(numbers[4] && numbers[5])
        speakOutput += numbers[4] + (isGermanLang() ? " ist " : " is ") + numbers[5] + ".<break time=\"500ms\"/>";
    
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
                speechOutput += "In der letzten Ziehung Powerball von " + date + " hast du den Jackpot geknackt! Alle Zahlen und auch den Powerball hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! ";
            else
                speechOutput += "The last drawing of powerball was on " + date + ". And you won the jackpot! You predicted all numbers and the powerball correctly! Let´s get the party started! Congratulation! ";

            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Powerball von " + date + " hast du " + powerBallOdds['rank'+myRank][0] + " richtige Zahlen" + (powerBallOdds['rank'+myRank][1] == 1 ? " und sogar den Powerball richtig!" : "!") + " Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of powerball was on " + date + ". You have " + powerBallOdds['rank'+myRank][0] + " matching numbers" + (powerBallOdds['rank'+myRank][1] == 1 ? " and the powerball does match as well!" : "!") + " Congratulation! " + moneySpeech;
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