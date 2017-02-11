'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://media.lottoland.com/api/drawings/euroJackpot";
var euroJackpotOdds = {"rank1": [5,2], "rank2": [5,1], "rank3": [5,0], "rank4": [4,2], "rank5": [4,1], "rank6": [4,0], "rank7": [3,2], "rank8": [2,2], "rank9": [3,1], "rank10": [3,0], "rank11": [1,2], "rank12": [2,1]};

function EuroJackpotApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

EuroJackpotApiHelper.prototype.getLastLotteryNumbers =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = json.last.numbers;
            numbers[1] = json.last.euroNumbers
            
            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

EuroJackpotApiHelper.prototype.getOdds = function() {
    return euroJackpotOdds;
};

EuroJackpotApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= 12; i++)
    {
        if(euroJackpotOdds['rank'+i][0] == myRank[0] && euroJackpotOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

EuroJackpotApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case "":
            speechOutput += "In der letzten Ziehung hast du leider nichts gewonnen.";
        case "rank1":
            speechOutput += "In der letzten Ziehung hast du den JackPott geknackt! Alle Zahlen und auch die Superzahl hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch!";
        default:
            speechOutput += "In der letzten Ziehung hast du";
            speechOutput += euroJackpotOdds[myRank][0] == 1 ? " eine richtige Zahl " : euroJackpotOdds[myRank][0] + " richtige Zahlen ";
            speechOutput += (euroJackpotOdds[myRank][1] == 1 ? " und eine Eurozahl richtig!" : "");
            speechOutput += (euroJackpotOdds[myRank][1] == 2 ? " und zwei Eurozahlen richtig!" : "");
            speechOutput += "! Herzlichen Glückwunsch!";
    }

    speechOutput += "<break time=\"200ms\"/>Alle Angaben wie immer ohne Gewähr.</speak>";

    return speechOutput;
};

module.exports = EuroJackpotApiHelper;