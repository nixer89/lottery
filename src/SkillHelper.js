'use strict';

//LOTTERY CONFIG START
var GermanLotteryApi = require('./api/GermanLotteryApiHelper');
var GermanLotteryDb = require('./db/GermanLotteryDbHelper');
var germanLottoyApi = new GermanLotteryApi();
var germanLottoyDb = new GermanLotteryDb();
var GERMAN_LOTTERY = "sechs aus neun und vierzig";
var GermanLottoConfig = { "lotteryName": GERMAN_LOTTERY, "speechLotteryName": "6aus49", "additionalNumberName": "Superzahl", "numberCountMain": 6, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 49, "minRangeAdditional": 0, "maxRangeAdditional": 9};

var EuroJackpotApi = require('./api/EuroJackpotApiHelper');
var EuroJackpotDb = require('./db/EuroJackpotDbHelper');
var euroJackPottApi = new EuroJackpotApi();
var euroJackPottDb = new EuroJackpotDb();
var EUROJACKPOT = "euro jackpot";
var EuroJackpotConfig = { "lotteryName": EUROJACKPOT, "speechLotteryName": "Eurojackpott", "additionalNumberName": "Eurozahl", "numberCountMain": 5, "numberCountAdditional": 2, "minRangeMain": 1, "maxRangeMain": 50, "minRangeAdditional": 1, "maxRangeAdditional": 10};

var EuroMillionsApi = require('./api/EuroMillionsApiHelper');
var EuroMillionsDb = require('./db/EuroMillionsDbHelper');
var euroMillionsApi = new EuroMillionsApi();
var euroMillionsDb = new EuroMillionsDb();
var EUROMILLIONS = "euro millions";
var EuroMillionsConfig = { "lotteryName": EUROMILLIONS, "speechLotteryName": "Euromillions", "additionalNumberName": "Sternzahl", "numberCountMain": 5, "numberCountAdditional": 2, "minRangeMain": 1, "maxRangeMain": 50,"minRangeAdditional": 1, "maxRangeAdditional": 12};

var PowerBallApi = require('./api/PowerBallApiHelper');
var PowerBallDb = require('./db/PowerBallDbHelper');
var powerBallApi = new PowerBallApi();
var powerBallDb = new PowerBallDb();
var POWERBALL = "powerball";
var PowerBallConfig = { "lotteryName": POWERBALL, "speechLotteryName": "PowerBall", "additionalNumberName": "Powerball", "numberCountMain": 5, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 69,"minRangeAdditional": 1, "maxRangeAdditional": 26};

var MegaMillionsApi = require('./api/MegaMillionsApiHelper');
var MegaMillionsDb = require('./db/MegaMillionsDbHelper');
var megaMillionsApi = new MegaMillionsApi();
var megaMillionsDb = new MegaMillionsDb();
var MEGAMILLIONS = "mega millions";
var MegaMillionsConfig = { "lotteryName": MEGAMILLIONS, "speechLotteryName": "MegaMillions", "additionalNumberName": "Megaball", "numberCountMain": 5, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 75,"minRangeAdditional": 1, "maxRangeAdditional": 15};
//LOTTERY CONFIG END

function SkillHelper() {}

SkillHelper.prototype.getCorrectNamingOfNumber = function(number) {
    switch(number) {
        case 1: return "erste";
        case 2: return "zweite";
        case 3: return "dritte";
        case 4: return "vierte";
        case 5: return "fünfte";
        case 6: return "sechste";
        case 7: return "siebte";
        case 8: return "achte";
        case 9: return "neunte";
        case 10: return "zehnte";
    }
}

SkillHelper.prototype.getCorrectPreWordAdditionalNumber = function(lotteryName) {
    switch(lotteryName) {
        case POWERBALL:
        case MEGAMILLIONS: return "dein ";
        default: return "deine ";
    }
}

SkillHelper.prototype.getConfigByUtterance = function(lotteryName) {
    switch(lotteryName) {
        case GERMAN_LOTTERY: return GermanLottoConfig;
        case EUROJACKPOT: return EuroJackpotConfig;
        case EUROMILLIONS: return EuroMillionsConfig;
        case POWERBALL: return PowerBallConfig;
        case MEGAMILLIONS: return MegaMillionsConfig;
        default: return "";
    }
}

SkillHelper.prototype.getLotteryApiHelper = function(lotteryName) {
    switch(lotteryName) {
        case GERMAN_LOTTERY: return germanLottoyApi;
        case EUROJACKPOT: return euroJackPottApi;
        case EUROMILLIONS: return euroMillionsApi;
        case POWERBALL: return powerBallApi;
        case MEGAMILLIONS: return megaMillionsApi;
        default: return "";
    }
}

SkillHelper.prototype.getLotteryDbHelper = function(lotteryName) {
    switch(lotteryName) {
        case GERMAN_LOTTERY: return germanLottoyDb;
        case EUROJACKPOT: return euroJackPottDb;
        case EUROMILLIONS: return euroMillionsDb;
        case POWERBALL: return powerBallDb;
        case MEGAMILLIONS: return megaMillionsDb;
        default: return "";
    }
}

SkillHelper.prototype.convertNewNumbersForStoring = function(newNumbers) {
    var convertedNumbers = [[],[]];
    for(var i = 0; i < newNumbers.length;i++)
        for(var j = 0; j < newNumbers[i].length; j++)
            convertedNumbers[i].push(newNumbers[i][j].toString());

    return convertedNumbers;
}

SkillHelper.prototype.sortLotteryNumbers = function(lotteryNumbers) {
    var sortedLotteryArray = [[[]]];
    for(var i = 0; i < lotteryNumbers.length; i++) {
        sortedLotteryArray[i] = sortLotteryNumbersSub(lotteryNumbers[i]);
    }

    return sortedLotteryArray;
}

function sortLotteryNumbersSub(lotteryNumbers) {
    var sortedLotteryArray = [[]];
    for(var i = 0; i < lotteryNumbers.length; i++) {

        var tempArray = [];

        //convert string values from db to numbers to sort them later!
        for(var k = 0; k < lotteryNumbers[i].length; k++) {
            tempArray.push(Number(lotteryNumbers[i][k]));
        }

        //sort by numbers
        tempArray = tempArray.sort((a, b) => a - b);

        //set array to index
        sortedLotteryArray[i] = [];

        //set numbers to new array and convert them to string to make it easier to compare and save
        for(var j = 0; j < tempArray.length; j++)
            sortedLotteryArray[i].push(tempArray[j].toString());
    }

    return sortedLotteryArray;
}

module.exports = SkillHelper;