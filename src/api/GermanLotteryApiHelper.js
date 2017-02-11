'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://media.lottoland.com/api/drawings/german6aus49";
var germanOdds = {"rank1": [6,1], "rank2": [6,0], "rank3": [5,1], "rank4": [5,0], "rank5": [4,1], "rank6": [4,0], "rank7": [3,1], "rank8": [3,0], "rank9": [2,1]};

function GermanLotteryApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLastLotteryNumbers =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            var numbers = [];
            numbers[0] = json.last.numbers;
            numbers[1] = Array(1).fill(json.last.superzahl);            

            return numbers;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

GermanLotteryApiHelper.prototype.getLotteryOddRank = function(numberOfMatchesMain, numberOfMatchesAdditional) {
    var myRank = [numberOfMatchesMain, numberOfMatchesAdditional];
    for(var i = 1; i <= 9; i++)
    {
        if(germanOdds['rank'+i][0] == myRank[0] && germanOdds['rank'+i][1] == myRank[1])
            return i;
    }

    return 1000;
};

GermanLotteryApiHelper.prototype.createLotteryWinSpeechOutput = function(myRank) {
    var speechOutput = "<speak>";

    switch(myRank) {
        case "":
            speechOutput += "In der letzten Ziehung hast du leider nichts gewonnen.";
        case "rank1":
            speechOutput += "In der letzten Ziehung hast du den JackPott geknackt! Alle Zahlen und auch die Superzahl hast du richtig getippt. Jetzt kannst du es richtig krachen lassen! Herzlichen Glückwunsch!";
        default:
            speechOutput += "In der letzten Ziehung hast du " + germanOdds[myRank][0] + " richtige Zahlen" + (germanOdds[myRank][1] == 1 ? " und sogar die Superzahl richtig!" : "!") + " Herzlichen Glückwunsch!";
    }

    speechOutput += "<break time=\"200ms\"/>Alle Angaben wie immer ohne Gewähr.</speak>";

    return speechOutput;
};

module.exports = GermanLotteryApiHelper;