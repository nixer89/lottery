'use strict';

var OverAllApi = require('./api/OverAllApiHelper');
var OverAllDb = require('./db/OverAllDbHelper');
var overAllWinApi = new OverAllApi();
var overAllWinDb = new OverAllDb();

var skillHelperPrototype = require('./SkillHelper');
var skillHelper = new skillHelperPrototype();

function OverAllWinHelper() {}

OverAllWinHelper.prototype.generateOverAllWinOutput = function(session, response) {
    //just get all the stuff in a first step!
    overAllWinDb.readAllLotteryNumbers(session.user.userId).then(function(allNumbers) {
        var german6aus49Db = allNumbers.german6aus49;
        var euroJackpotDb = allNumbers.euroJackpot;
        var euroMillionsDb = allNumbers.euroMillions;
        var megaMillionsDb = allNumbers.megaMillions;
        var powerBallDb = allNumbers.powerBall;

        overAllWinApi.getAllDrawings().then(function(allDrawings) {
            var german6aus49Api = [];
            german6aus49[0] = stringifyArray(allDrawings.german6aus49.last.numbers);
            german6aus49[1] = stringifyArray(Array(1).fill(allDrawings.german6aus49.last.superzahl));

            var euroJackpotApi = [];
            euroJackpotApi[0] = stringifyArray(allDrawings.euroJackpot.last.numbers);
            euroJackpotApi[1] = stringifyArray(allDrawings.euroJackpot.last.euroNumbers);

            var euroMillionsApi = [];
            euroMillionsApi[0] = stringifyArray(allDrawings.euroMillions.last.numbers);
            euroMillionsApi[1] = stringifyArray(allDrawings.euroMillions.last.stars);

            var megaMillionsApi = [];
            megaMillionsApi[0] = stringifyArray(allDrawings.megaMillions.last.numbers);
            megaMillionsApi[1] = stringifyArray(Array(1).fill(allDrawings.megaMillions.last.megaballs));

            var powerBallApi = [];
            powerBallApi[0] = stringifyArray(allDrawings.powerBall.last.numbers);
            powerBallApi[1] = stringifyArray(Array(1).fill(allDrawings.powerBall.last.powerballs));

        })
    });
}

function getRank(numbersDb, numbersApi) {
    //check how many matches we have with the given numbers!
    var numberOfMatchesMain = 0;
    var numberOfMatchesAdditional= 0;
    var rank = 1000;

    for(var i = 0; i < numbersDb.length; i++) {
        var numberOfMatchesMainTmp = numbersApi.filter(n => myNumbers[i][0].indexOf(n) != -1).length;
        var numberOfMatchesAdditionalTmp = numbersApi.filter(n => myNumbers[i][1].indexOf(n) != -1).length;

        var rankTemp = skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLotteryOddRank(numberOfMatchesMainTmp,numberOfMatchesAdditionalTmp);

        if(rankTemp < rank) {
            rank = rankTemp;
            numberOfMatchesMain = numberOfMatchesMainTmp; 
            numberOfMatchesAdditional = numberOfMatchesAdditionalTmp;
            gewinnZahlen = myNumbers[i]; // save for later use maybe?
        }
    }
}

function stringifyArray(numberArray) {
    for(var i = 0; i < numberArray.length; i++) {
        numberArray[i] = numberArray[i]+"";
    }
    return numberArray;
}

module.exports = OverAllWinHelper;