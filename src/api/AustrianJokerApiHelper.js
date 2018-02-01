'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings/austriaLotto";
var jokerOdds = {"rank1": [6,0], "rank2": [5,0], "rank3": [4,0], "rank4": [3,0], "rank5": [2,0], "rank6": [1,0]};
var jokerPrizes = {"rank1": 0, "rank2": 7700, "rank3": 770, "rank4": 77, "rank5": 7, "rank6": 1.5};
var locale="";

function AustrianJokerApiHelper(currentLocale) {
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

AustrianJokerApiHelper.prototype.getLastLotteryDateAndNumbers = function() {
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
            
            numbersAndDate[0] = stringifyArray((lastLottery.joker+"").split(""));
            numbersAndDate[1] = -1;
            numbersAndDate[2] = lotteryDateString;
            numbersAndDate[3] = "";//json.last.currency;

            return numbersAndDate;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianJokerApiHelper.prototype.getLastLotteryNumbers = function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            var lastLottery = null;
            
            if(json.last.numbers && json.last.numbers.length > 0) {
                lastLottery = json.last;
            } else {
                lastLottery = json.past;
            }

            numbers[0] = stringifyArray((lastLottery.joker+"").split(""));
            numbers[1] = "-1";

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

AustrianJokerApiHelper.prototype.getCorrectArticle = function() {
    if(isGermanLang())
        return "Die ";
    else
        return "The ";
}

AustrianJokerApiHelper.prototype.getNextLotteryDrawingDate = function() {
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

AustrianJokerApiHelper.prototype.getCurrentJackpot =function() {
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

AustrianJokerApiHelper.prototype.getLastPrizeByRank = function(myRank) {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json) {
        if(json) {
            var lastLottery = null;
            
            if(json.last.numbers && json.last.numbers.length > 0) {
                lastLottery = json.last;
            } else {
                lastLottery = json.past;
            }

            if(lastLottery.jokerOdds && lastLottery.jokerOdds['rank'+myRank]) {
                if(lastLottery.jokerOdds['rank'+myRank].prize > 0) {
                    var price = lastLottery.jokerOdds['rank'+myRank].prize + "";
                    price = price.substring(0, price.length-2) + (isGermanLang() ? "," : ".") + price.substring(price.length-2);
                    return formatPrize(price);
                } else {
                    return null;
                }
            }  else if(jokerPrizes['rank'+myRank] && jokerPrizes['rank'+myRank] > 0) { // no internet, use if not jackpot!
                return formatPrize(jokerPrizes['rank'+myRank]+"");
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

function formatPrize(prize) {
    if(isGermanLang())
        prize = prize.replace('.',',');

    return prize + " €.";
}

AustrianJokerApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= Object.keys(jokerOdds).length; i++)
    {
        if(jokerOdds['rank'+i][0] == myRank[0] && jokerOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

AustrianJokerApiHelper.prototype.createSSMLOutputForNumbers = function(numbers) {
  var speakOutput = "";
  var mainNumbers = numbers[0];

  for(var i = 0; i < mainNumbers.length; i++)
      speakOutput += mainNumbers[i] + "<break time=\"500ms\"/>";

  return speakOutput;
};

AustrianJokerApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank, moneySpeech, date) {
    var speechOutput = "";

    switch(myRank) {
        case 1000:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Joker von " + date + " hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "The last drawing of joker was on " + date + ". Unfortunately, you didn`t win anything. I wish you all the luck next time!";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Joker von " + date + " stimmen alle deine Zahlen überein!. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of joker was on " + date + ". And all your numbers are matching to the drawn numbers! Let´s get the party started! Congratulation! " + moneySpeech ;
            break;
        case 6:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Joker von " + date + " stimmt die letzte Zahl überein. Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of joker was on " + date + ". Your last number matches the drawing. Congratulation! " + moneySpeech;
            break;
        default:
            if(isGermanLang())
                speechOutput += "In der letzten Ziehung Joker von " + date + " stimmen die letzten " + jokerOdds['rank'+myRank][0] + " Zahlen überein. Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += "The last drawing of joker was on " + date + ". Your last " + jokerOdds['rank'+myRank][0] + " numbers are matching. Congratulation! " + moneySpeech;
    }

    return speechOutput;
};

AustrianJokerApiHelper.prototype.createLotteryWinSpeechOutputShort = function(myRank, moneySpeech, date) {
    var speechOutput = "<break time=\"500ms\"/>";

    switch(myRank) {
        case 1000:
            if(isGermanLang())
                speechOutput += " In Joker hast du leider nichts gewonnen. Dennoch wünsche ich dir weiterhin viel Glück!";
            else
                speechOutput += "Unfortunately, you didn`t win anything in joker. I wish you all the luck next time";
            break;
        case 1:
            if(isGermanLang())
                speechOutput += " In Joker stimmen alle deine Zahlen überein!. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += " In joker, all your numbers are matching to the drawn numbers!. Let´s get the party started! Congratulation! " + moneySpeech;
            break;
        case 6:
            if(isGermanLang())
                speechOutput += " In Joker stimmt die letzte Zahl überein. Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += " In joker, your last number matches the drawing. Congratulation! " + moneySpeech;
            break;
        default:
            if(isGermanLang())
                speechOutput += " In Joker stimmen die letzten " + jokerOdds['rank'+myRank][0] + " Zahlen überein. Herzlichen Glückwunsch! " + moneySpeech;
            else
                speechOutput += " In joker, your last " + jokerOdds['rank'+myRank][0] + " numbers are matching. Congratulation! " + moneySpeech;
    }

    return speechOutput;
};

AustrianJokerApiHelper.prototype.getOdds = function() {
    return jokerOdds;
}

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = AustrianJokerApiHelper;