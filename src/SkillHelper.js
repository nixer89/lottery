'use strict';

//var overAllWinHelperPrototype = require('./OverAllWinHelper');
//var overAllHelper = new overAllWinHelperPrototype();

var locale = "";

//LOTTERY CONFIG START
var GermanLotteryApi = require('./api/GermanLotteryApiHelper');
var GermanLotteryDb = require('./db/GermanLotteryDbHelper');
var germanLottoApi;
var germanLottoDb = new GermanLotteryDb();
var GERMAN_LOTTERY = "sechs aus neun und vierzig";
var GermanLottoConfig = { "lotteryName": GERMAN_LOTTERY, "speechLotteryName": "6aus49", "additionalNumberName": "Superzahl", "isZusatzLottery": false, "numberCountMain": 6, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 49, "minRangeAdditional": 0, "maxRangeAdditional": 9};

var Spiel77Api = require('./api/Spiel77ApiHelper');
var Spiel77Db = require('./db/Spiel77DbHelper');
var spiel77Api;
var spiel77Db = new Spiel77Db();
var SPIEL77 = "spiel sieben und siebzig";
var Spiel77Config = { "lotteryName": SPIEL77, "speechLotteryName": SPIEL77, "additionalNumberName": "", "isZusatzLottery": true, "numberCountMain": 7, "numberCountAdditional": 0, "minRangeMain": 0, "maxRangeMain": 9, "minRangeAdditional": 0, "maxRangeAdditional": 0};

var Super6Api = require('./api/Super6ApiHelper');
var Super6Db = require('./db/Super6DbHelper');
var super6Api;
var super6Db = new Super6Db();
var SUPER6 = "super sechs";
var Super6Config = { "lotteryName": SUPER6, "speechLotteryName": SUPER6, "additionalNumberName": "", "isZusatzLottery": true, "numberCountMain": 7, "numberCountAdditional": 0, "minRangeMain": 0, "maxRangeMain": 9, "minRangeAdditional": 0, "maxRangeAdditional": 0};

var EuroJackpotApi = require('./api/EuroJackpotApiHelper');
var EuroJackpotDb = require('./db/EuroJackpotDbHelper');
var euroJackPottApi;
var euroJackPottDb = new EuroJackpotDb();
var EUROJACKPOT = "euro jackpot";
var EuroJackpotConfig = { "lotteryName": EUROJACKPOT, "speechLotteryName": "euro jackpot", "additionalNumberName": "Eurozahl", "isZusatzLottery": false, "numberCountMain": 5, "numberCountAdditional": 2, "minRangeMain": 1, "maxRangeMain": 50, "minRangeAdditional": 1, "maxRangeAdditional": 10};

var EuroMillionsApi = require('./api/EuroMillionsApiHelper');
var EuroMillionsDb = require('./db/EuroMillionsDbHelper');
var euroMillionsApi;
var euroMillionsDb = new EuroMillionsDb();
var EUROMILLIONS = "euro millions";
var EuroMillionsConfig = { "lotteryName": EUROMILLIONS, "speechLotteryName": "euro millions", "additionalNumberName":  "Sternzahl", "isZusatzLottery": false, "numberCountMain": 5, "numberCountAdditional": 2, "minRangeMain": 1, "maxRangeMain": 50,"minRangeAdditional": 1, "maxRangeAdditional": 12};

var PowerBallApi = require('./api/PowerBallApiHelper');
var PowerBallDb = require('./db/PowerBallDbHelper');
var powerBallApi;
var powerBallDb = new PowerBallDb();
var POWERBALL = "powerball";
var PowerBallConfig = { "lotteryName": POWERBALL, "speechLotteryName": "PowerBall", "additionalNumberName": "Powerball", "isZusatzLottery": false, "numberCountMain": 5, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 69,"minRangeAdditional": 1, "maxRangeAdditional": 26};

var MegaMillionsApi = require('./api/MegaMillionsApiHelper');
var MegaMillionsDb = require('./db/MegaMillionsDbHelper');
var megaMillionsApi;
var megaMillionsDb = new MegaMillionsDb();
var MEGAMILLIONS = "mega millions";
var MegaMillionsConfig = { "lotteryName": MEGAMILLIONS, "speechLotteryName": "mega millions", "additionalNumberName": "Megaball", "isZusatzLottery": false, "numberCountMain": 5, "numberCountAdditional": 1, "minRangeMain": 1, "maxRangeMain": 75,"minRangeAdditional": 1, "maxRangeAdditional": 15};

var AustrianLotteryApi = require('./api/AustrianLotteryApiHelper');
var AustrianLotteryDb = require('./db/AustrianLotteryDbHelper');
var austrianLottoApi;
var austrianLottoDb = new AustrianLotteryDb();
var AUSTRIAN_LOTTERY = "sechs aus fünf und vierzig";
var AustrianLottoConfig = { "lotteryName": AUSTRIAN_LOTTERY, "speechLotteryName": "6aus45", "additionalNumberName": "Zusatzzahl", "isZusatzLottery": false, "numberCountMain": 6, "numberCountAdditional": 0, "minRangeMain": 1, "maxRangeMain": 45, "minRangeAdditional": 0, "maxRangeAdditional": 0};

var AustrianJokerApi = require('./api/AustrianJokerApiHelper');
var AustrianJokerDb = require('./db/AustrianJokerDbHelper');
var austrianJokerApi;
var austrienJokerDb = new AustrianJokerDb();
var AUSTRIAN_JOKER = "joker";
var austrianJokerConfig = { "lotteryName": AUSTRIAN_JOKER, "speechLotteryName": AUSTRIAN_JOKER, "additionalNumberName": "", "isZusatzLottery": true, "numberCountMain": 6, "numberCountAdditional": 0, "minRangeMain": 0, "maxRangeMain": 9, "minRangeAdditional": 0, "maxRangeAdditional": 0};
//LOTTERY CONFIG END

var supportedLotteries = [GERMAN_LOTTERY, SPIEL77, SUPER6, EUROJACKPOT, EUROMILLIONS, POWERBALL, MEGAMILLIONS, AUSTRIAN_LOTTERY, AUSTRIAN_JOKER];

function SkillHelper(currentLocale) {
    locale = currentLocale;

    germanLottoApi = new GermanLotteryApi(locale);
    spiel77Api = new Spiel77Api(locale);
    super6Api = new Super6Api(locale);
    euroJackPottApi = new EuroJackpotApi(locale);
    euroMillionsApi = new EuroMillionsApi(locale);
    powerBallApi= new PowerBallApi(locale);
    megaMillionsApi = new MegaMillionsApi(locale);
    austrianLottoApi = new AustrianLotteryApi(locale);
    austrianJokerApi = new AustrianJokerApi(locale);

    if(this.isGermanLang()) {
        console.log("it is german language! " + locale);
        GERMAN_LOTTERY = "sechs aus neun und vierzig";
        GermanLottoConfig.lotteryName = GERMAN_LOTTERY;
        GermanLottoConfig.speechLotteryName = GERMAN_LOTTERY;
        GermanLottoConfig.additionalNumberName = "Superzahl";

        SPIEL77 = "spiel sieben und siebzig";
        Spiel77Config.lotteryName = SPIEL77;
        Spiel77Config.speechLotteryName = SPIEL77;

        SUPER6 = "super sechs";
        Super6Config.lotteryName = SUPER6;
        Super6Config.speechLotteryName = SUPER6;

        EuroJackpotConfig.additionalNumberName = "Eurozahl";
        EuroMillionsConfig.additionalNumberName = "Sternzahl";

        AUSTRIAN_LOTTERY = "sechs aus fünf und vierzig";
        AustrianLottoConfig.lotteryName = AUSTRIAN_LOTTERY;
        AustrianLottoConfig.speechLotteryName = AUSTRIAN_LOTTERY;

        supportedLotteries = [GERMAN_LOTTERY, SPIEL77, SUPER6, EUROJACKPOT, EUROMILLIONS, POWERBALL, MEGAMILLIONS, AUSTRIAN_LOTTERY, AUSTRIAN_JOKER];
    } else {
        console.log("it is not german language! " + locale);
        GERMAN_LOTTERY = "german lotto";
        GermanLottoConfig.lotteryName = GERMAN_LOTTERY;
        GermanLottoConfig.speechLotteryName = GERMAN_LOTTERY;
        GermanLottoConfig.additionalNumberName = "SuperBall";

        SPIEL77 = "game seventyseven";
        Spiel77Config.lotteryName = SPIEL77;
        Spiel77Config.speechLotteryName = SPIEL77;

        SUPER6 = "super sechs";
        Super6Config.lotteryName = SUPER6;
        Super6Config.speechLotteryName = SUPER6;

        EuroJackpotConfig.additionalNumberName = "euronumber";
        EuroMillionsConfig.additionalNumberName = "star";

        AUSTRIAN_LOTTERY = "austrian lotto";
        AustrianLottoConfig.lotteryName = AUSTRIAN_LOTTERY;
        AustrianLottoConfig.speechLotteryName = AUSTRIAN_LOTTERY;

        supportedLotteries = [GERMAN_LOTTERY, SPIEL77, SUPER6, EUROJACKPOT, EUROMILLIONS, POWERBALL, MEGAMILLIONS, AUSTRIAN_LOTTERY, AUSTRIAN_JOKER];
    }
}

SkillHelper.prototype.isGermanLang = function() {
    return 'de-DE' == locale;
}

SkillHelper.prototype.isLotteryNameSupported = function(lotteryName) {
    console.log("verstandene lotterie: " + lotteryName);
    console.log("supported lotteries: " + JSON.stringify(supportedLotteries));
    console.log("current locale: " + locale);

    return supportedLotteries.indexOf(lotteryName.toLowerCase()) != -1;
}

SkillHelper.prototype.getCorrectNamingOfNumber = function(number) {

    if(this.isGermanLang()) {
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
    } else {
        switch(number) {
            case 1: return "first";
            case 2: return "second";
            case 3: return "third";
            case 4: return "fourth";
            case 5: return "fifth";
            case 6: return "sixth";
            case 7: return "seventh";
            case 8: return "eighth";
            case 9: return "ninth";
            case 10: return "tenth";
        }
    }
}

SkillHelper.prototype.getGermanLotteryName = function() {
    return GERMAN_LOTTERY;
}

SkillHelper.prototype.getSpiel77LotteryName = function() {
    return SPIEL77;
}

SkillHelper.prototype.getSuper6LotteryName = function() {
    return SUPER6;
}

SkillHelper.prototype.getAustrianLotteryName = function() {
    return AUSTRIAN_LOTTERY;
}

SkillHelper.prototype.getJokerLotteryName = function() {
    return AUSTRIAN_JOKER;
}

SkillHelper.prototype.getCorrectPreWordAdditionalNumber = function(lotteryName) {
    switch(lotteryName.toLowerCase()) {
        case POWERBALL:
        case MEGAMILLIONS: return (this.isGermanLang() ? "dein " : "your ");
        default: return (this.isGermanLang() ? "deine " : "your ");
    }
}

SkillHelper.prototype.getConfigByUtterance = function(lotteryName) {
    switch(lotteryName.toLowerCase()) {
        case GERMAN_LOTTERY: return GermanLottoConfig;
        case SPIEL77: return Spiel77Config;
        case SUPER6: return Super6Config;
        case EUROJACKPOT: return EuroJackpotConfig;
        case EUROMILLIONS: return EuroMillionsConfig;
        case POWERBALL: return PowerBallConfig;
        case MEGAMILLIONS: return MegaMillionsConfig;
        case AUSTRIAN_LOTTERY: return AustrianLottoConfig;
        case AUSTRIAN_JOKER: return austrianJokerConfig;
        default: return "";
    }
}

SkillHelper.prototype.getLotteryApiHelper = function(lotteryName) {
    switch(lotteryName.toLowerCase()) {
        case GERMAN_LOTTERY: return germanLottoApi;
        case SPIEL77: return spiel77Api;
        case SUPER6: return super6Api;
        case EUROJACKPOT: return euroJackPottApi;
        case EUROMILLIONS: return euroMillionsApi;
        case POWERBALL: return powerBallApi;
        case MEGAMILLIONS: return megaMillionsApi;
        case AUSTRIAN_LOTTERY: return austrianLottoApi;
        case AUSTRIAN_JOKER: return austrianJokerApi;
        default: return "";
    }
}

SkillHelper.prototype.getLotteryDbHelper = function(lotteryName) {
    switch(lotteryName.toLowerCase()) {
        case GERMAN_LOTTERY: return germanLottoDb;
        case SPIEL77: return spiel77Db;
        case SUPER6: return super6Db;
        case EUROJACKPOT: return euroJackPottDb;
        case EUROMILLIONS: return euroMillionsDb;
        case POWERBALL: return powerBallDb;
        case MEGAMILLIONS: return megaMillionsDb;
        case AUSTRIAN_LOTTERY: return austrianLottoDb;
        case AUSTRIAN_JOKER: return austrienJokerDb;
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

SkillHelper.prototype.convertTippscheinnummer = function(lotteryNumbers) {
    var convertedArray = [[[]]];
    for(var i = 0; i < lotteryNumbers.length; i++) {
        convertedArray[i] = convertTippscheinnummerSub(lotteryNumbers[i]);
    }

    return convertedArray;
}

function convertTippscheinnummerSub(lotteryNumbers) {
    var convertedArray = [[]];
    for(var i = 0; i < lotteryNumbers.length; i++) {

        var tempArray = [];

        //convert string values from db to numbers to sort them later!
        for(var k = 0; k < lotteryNumbers[i].length; k++) {
            tempArray = lotteryNumbers[i][k].split("");
        }

        //set array to index
        convertedArray[i] = tempArray;
    }

    return convertedArray;
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

SkillHelper.prototype.getRank = function(attributes, lotteryNumbersAndDate, myNumbers) {
    var numberOfMatchesMain = 0;
    var numberOfMatchesAdditional= 0;
    var rank = 1000;

    for(var i = 0; i < myNumbers.length; i++) {
        var numberOfMatchesMainTmp = getMatchingNumbers(attributes, lotteryNumbersAndDate[0], myNumbers[i][0]).length;
        var numberOfMatchesAdditionalTmp;

        if(attributes.currentConfig.lotteryName == AUSTRIAN_LOTTERY)
            numberOfMatchesAdditionalTmp = getMatchingNumbers(attributes, lotteryNumbersAndDate[1], myNumbers[i][0]).length;
        else
            numberOfMatchesAdditionalTmp = getMatchingNumbers(attributes, lotteryNumbersAndDate[1], myNumbers[i][1]).length;

        var rankTemp = this.getLotteryApiHelper(attributes.currentConfig.lotteryName).getLotteryOddRank(numberOfMatchesMainTmp,numberOfMatchesAdditionalTmp);

        if(rankTemp < rank) {
            rank = rankTemp;
            numberOfMatchesMain = numberOfMatchesMainTmp; 
            numberOfMatchesAdditional = numberOfMatchesAdditionalTmp;
            //gewinnZahlen = myNumbers[i]; // save for later use maybe?
        }
    }

    return rank;
}

function getMatchingNumbers(attributes, gewinnZahlen, myNumbers) {
    if(!attributes.currentConfig.isZusatzLottery) {
        return gewinnZahlen.filter(n => myNumbers.indexOf(n) != -1);
    } else {
        var equalNumbers = [];

        if(myNumbers[0] == "-") {
            return equalNumbers;
        }

        var gewinnZahlenLength = gewinnZahlen.length-1;
        var myNumbersLength = myNumbers.length-1;

        while(gewinnZahlenLength >= 0) {
            if(myNumbers[myNumbersLength] == gewinnZahlen[gewinnZahlenLength]) {
                equalNumbers.unshift(myNumbers[myNumbersLength]);
                myNumbersLength--;
                gewinnZahlenLength--;
            }
            else
                return equalNumbers;
        }

        return equalNumbers;
    }
}

//SkillHelper.prototype.generateOverAllWinOutput = function(alexaSkill, response) {
//    overAllHelper.generateOverAllWinOutput(alexaSkill, response);
//}

module.exports = SkillHelper;