/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * App ID for the skill
 */
var APP_ID = process.env.APP_ID;

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var GermanApiHelper = require('./api/GermanLotteryApiHelper');
var GermanDbHelper = require('./db/GermanLotteryDbHelper');
var EuroJackpotApiHelper = require('./api/EuroJackpotApiHelper');
var EuroJackpotDbHelper = require('./db/EuroJackpotDbHelper');

var GERMAN_LOTTERY = "sechs aus neunundvierzig";
var EUROJACKPOT = "euro jackpot";
var GermanLottoConfig = { "lotteryName": GERMAN_LOTTERY, "additionalNumberName": "Superzahl", "numberCountMain": 6, "numberCountAdditional": 1, "maxRangeMain": 49, "maxRangeAdditional": 10, "apiHelper": new GermanApiHelper(), "dbHelper": new GermanDbHelper() };
var EuroJackptConfig = { "lotteryName": EUROJACKPOT, "additionalNumberName": "Eurozahl", "numberCountMain": 5, "numberCountAdditional": 2, "maxRangeMain": 50, "maxRangeAdditional": 10, "apiHelper": new EuroJackpotApiHelper(), "dbHelper": new EuroJackpotDbHelper() };

/**
 * Lotto is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Lotto = function () {
    AlexaSkill.call(this, APP_ID);
};

//var locale = "de-DE";

// Extend AlexaSkill
Lotto.prototype = Object.create(AlexaSkill.prototype);
Lotto.prototype.constructor = Lotto;

Lotto.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Lotto onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Lotto.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    resetAllSessionAttributes(session);

    response.ask("Willkommen bei Mein Lotto! Sage 'Feld hinzufügen und den Lotterie-Namen' um deine Lottozahlen zu speichern oder sage 'Hilfe' um dir weitere Kommandos in der Alexa App anzusehen.", "Sage 'Hilfe' um Kommandos in der Alexa App zu sehen!");
};

Lotto.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Lotto onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

var DE_Intent_Handler  = {
    // register custom intent handlers
    "HelloIntent": function (intent, session, response) {
        checkIntentStatus(session,response);
        response.ask("Hallo. Wenn du hilfe brauchst, sage einfach 'Hilfe'!", "Hallo!", "Hallo!");
    },
    "NewNumber": function (intent, session, response) {
        checkRemoveNumbersIntent(session, response);
        
        if(session.attributes.isAddingField && intent.slots.lotteryNumber.value) {
            doLotteryNumberCheck(response, session, intent.slots.lotteryNumber.value);
        } else if(intent.slots.lotteryNumber.value && !session.attributes.isAddingField) {
            response.ask("Wenn du deine Zahlen hinzufügen willst, musst du 'Feld hinzufügen und den Lotterie-Namen' sagen.")
        }else {
            response.ask("Tut mir leid, ich konnte die Zahl nicht verstehen. Bitte sage sie noch einmal.");
        }
    },
    "AddLotteryNumbers": function (intent, session, response) {
        if(intent.slots.lotteryName.value) {
            checkIntentStatus(session, response);
            setUpForNewField(session, intent.slots.lotteryName.value);
            response.ask("Ein neues Feld wird für " + intent.slots.lotteryName.value + " angelegt. Wie lautet deine erste Zahl?", "Wie lautet deine erste Zahl?");
        } else {
             response.ask("Tut mir leid, diese Lotterie kenne ich nicht. Frage mich, welche Lotterien unterstützt werden, um eine Übersicht in der Alexa App zu erhalten");
        }
    },
    "RemoveLotteryNumbers": function (intent, session, response) {
        if(intent.slots.lotteryName.value) {
            checkIntentStatus(session, response);
            session.attributes.currentConfig = getConfigByUtterance(intent.slots.lotteryName.value);
            session.attributes.isRemovingNumbers = true;
            response.ask("Alle deine Zahlen für " + intent.slots.lotteryName.value + " werden gelöscht und müssen neu angelegt werden. Bist du sicher?");
        } else {
             response.ask("Tut mir leid, diese Lotterie kenne ich nicht. Frage mich, welche Lotterien unterstützt werden, um eine Übersicht in der Alexa App zu erhalten");
        }
    },
    "AMAZON.YesIntent": function (intent, session, response) {
        session.attributes.currentConfig = EuroJackptConfig;
        if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //add new field
            saveNewLottoNumbers(session, response);
            resetAllSessionAttributes(session);
        } else if (session.attributes.isRemovingNumbers && session.attributes.currentConfig) {
            //remove all numbers
            session.attributes.currentConfig.dbHelper.removeLotteryNumbers(session.user.userId).then(function(result) {
                if(result) {
                    response.tell("Deine Zahlen für " + session.attributes.currentConfig.lotteryName + " wurden erfolgreich gelöscht!");
                }
            }).catch(function(error) {
                response.tell("Beim Löschen deiner Zahlen ist ein Fehler aufgetreten.");
            });
        } else {
            checkAddFieldIntent(session, response);
            response.ask("Entschuldige, ich habe dich nicht verstanden.");
        }
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        if(session.attributes.isAddingField && session.attributes.newLottoNumbers.length>0) {
            session.attributes.isAddingField = false;
            response.tell("Ok, deine Lottozahlen werden nicht gespeichert!");
        } else if(session.attributes.isRemovingNumbers) {
            session.attributes.isRemovingNumbers = false;
            response.tell("Ok, deine Lottozahlen werden nicht gelöscht!!");
        } else {
            checkAddFieldIntent(session, response);
            response.ask("Entschuldige, ich habe dich nicht verstanden.");
        }
    },
    "AskForLotteryWinIntent": function (intent, session, response) {
        if(intent.slots.lotteryName.value) {
            checkIntentStatus(session,response);
            var config= getConfigByUtterance(intent.slots.lotteryName.value);

            readLottoNumbers(config, session, response).then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    config.apiHelper.getLastLotteryNumbers().then(function(lotteryNumbers) {
                        if(lotteryNumbers) {

                            //check how many matches we have with the given numbers!
                            var numberOfMatchesMain = 0;
                            var numberOfMatchesAdditional= 0;
                            var rank = 1000;

                            for(var i = 0; i < myNumbers.length; i++) {
                                var numberOfMatchesMainTmp = getMatchingNumbers(lotteryNumbers[0], myNumbers[i][0]).length;
                                var numberOfMatchesAdditionalTmp = getMatchingNumbers(lotteryNumbers[0], myNumbers[i][0]).length;

                                var rankTemp = config.apiHelper.getLotteryOddRank(numberOfMatchesMain,numberOfMatchesAdditional);

                                if(rankTemp < rank) {
                                    numberOfMatchesMain = numberOfMatchesMainTmp; 
                                    numberOfMatchesAdditional = numberOfMatchesAdditionalTmp;
                                    gewinnZahlen = myNumbers[i]; // save for later use maybe?
                                }
                            }

                            var speechOutput = config.apiHelper.createLotteryWinSpeechOutput(numberOfMatchesMain, numberOfMatchesAdditional);

                            response.tell({type:"SSML",speech: speechOutput});
                        } else {
                            response.tell("Bei der Abfrage der letzten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.");
                        }
                    });
                }
                else {
                    response.ask("Du musst erst Lottozahlen hinterlegen, damit ich prüfen kann, ob du gewonnen hast. Sage dazu einfach 'Feld hinzufügen und den Lotterie-Namen'");
                    resetAllSessionAttributes(session);
                }
            });
        } else {
            response.ask("Entschuldige, ich habe dich nicht verstanden.");
        }
    },
    "MyCurrentNumbers": function (intent, session, response) {
        if(intent.slots.lotteryName.value) {
            checkIntentStatus(session,response);
            var config= getConfigByUtterance(intent.slots.lotteryName.value);

            readLotteryNumbers(config, session, response).then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    var speakOutput = "<speak>Hier sind deine aktuell gespeicherten "+ intent.slots.lotteryName.value + " Zahlen: <break time=\"200ms\"/>";

                    for(var i = 0; i < myNumbers.length; i++) {
                        speakOutput += (myNumbers.length > 1 ? "Feld " + (i+1) : "") + ": <break time=\"500ms\"/>";
                        speakOutput += config.dbHelper.createSSMLOutputForField(myNumbers[i]);
                    }
                    speakOutput += "</speak>";

                    response.tell({type:"SSML",speech: speakOutput});

                } else {
                    response.ask("Du hast noch keine Lottozahlen hinterlegt. Sage 'Feld hinzufügen und den Lotterie-Namen' um deine Lottozahlen anzulegen.");
                }
            });
        } else {
            response.ask("Entschuldige, ich habe dich nicht verstanden.");
        }
    },
    "AskForLatestLotteryNumbers": function (intent, session, response) {
        if(intent.slots.lotteryName.value) {
            checkIntentStatus(session,response);
            var config= getConfigByUtterance(intent.slots.lotteryName.value);
            
            config.apiHelper.getLastLotteryNumbers().then(function(numbers) {
                if(numbers) {
                    var speakOutput = "<speak>Hier sind die Gewinnzahlen der letzten Ziehung: <break time=\"500ms\"/>";
                    speakOutput += config.dbHelper.createSSMLOutputForField(numbers);
                    speakOutput += ". <break time=\"200ms\"/>Alle Angaben wie immer ohne Gewähr</speak>";

                    response.tell({type:"SSML",speech: speakOutput});

                } else {
                    response.tell("Bei der Abfrage der letzten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.");
                }
            });

        }
        else {
            response.ask("Entschuldige, ich habe dich nicht verstanden.");
        }
     },
     "EndIntent": function (intent, session, response) {
         response.tell("Tschüss und viel Glück!");
     },
     "ThanksIntent": function (intent, session, response) {
         response.tell("Bitte!");
     },
    "AMAZON.HelpIntent": function (intent, session, response) {
        checkIntentStatus(session,response);

        var help = "Ich habe ein paar Beispiel-Kommandos an die Alexa App gesendet. Öffne die App und schaue dir die Kommandos an!";
        var cardTitle = "MeinLotto Kommandos";
        var cardContent = "Hier sind ein paar nützliche Kommandos. Du musst immer den Lotterie-Namen mit angeben!:\n- sage Alexa, sie soll ein neues Feld hinzufügen \n- frage Alexa, ob du gewonnen hast\n" +
         "- frage Alexa, was deine aktuell hinterlegten Zahlen sind\n- frage Alexa nach den aktuellen Lottozahlen";
        response.tellWithCard(help, cardTitle,cardContent);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        response.tell("Tschüss und weiterhin viel Glück!");
    },
    "TestIntent": function (intent, session, response) {
        var germanNumbers = [[["10","20","13","40","15","26"],["7", "1"]],[["49","21","13","31","15","1"],["2","8"]]];

        var config= getConfigByUtterance("sechs aus neunundvierzig");
        config.apiHelper.getLastLotteryNumbers().then(function(lotteryNumbers) {
            if(lotteryNumbers) {
                console.log("6aus49: " + lotteryNumbers);
                config= getConfigByUtterance("euro jackpot");
                config.apiHelper.getLastLotteryNumbers().then(function(lotteryNumbers) {
                    if(lotteryNumbers) {
                        console.log("Euro Jackpot: " + lotteryNumbers);
                    }
                });
            }
        });
    }
};

function setUpForNewField(session, lotteryName) {
    session.attributes.isAddingField = true;
    session.attributes.newNumbersMain = [];
    session.attributes.newNumbersAdditional = [];
    session.attributes.currentConfig = getConfigByUtterance(lotteryName);
}

function getConfigByUtterance(lotteryName) {
    if(GERMAN_LOTTERY == lotteryName || "lotto" == lotteryName) {
        return GermanLottoConfig;
    } else if(EUROJACKPOT == lotteryName) {
        return EuroJackptConfig
    } else {
        return "";
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Lotto skill.
    var lotto = new Lotto();

    //locale = event.request.locale

    //if (locale == 'en-US')
    //    Lotto.intentHandlers = US_Intent_Handler; //register us intent handler
    //else

    //only german supported so far
    lotto.intentHandlers = DE_Intent_Handler; //register german intent handler

    lotto.execute(event, context);
};

function saveNewLottoNumbers(session, response) {
    if(lotteryFieldHasMaxLength(session)) {
        readLottoNumbers(session.attributes.currentConfig, session, response).then(function(oldNumbers) {
            //convert numbers from int to string
            var convertedNumbers = convertNewNumbersForStoring(session.attributes.newLottoNumbers);

            //set new numbers at the end of all numbers
            oldNumbers[oldNumbers.length] = convertedNumbers;

            session.attributes.currentConfig.updateLotteryNumbers(session,oldNumbers).then(function(result) {
                if(result) {
                    response.tell("Deine Zahlen wurden erfolgreich gespeichert.")
                } else {
                    response.tell("Deine Zahlen konnten nicht gespeichert werden. Es kam zu einem Fehler.")
                }
            }); 
        });
    }
}

function convertNewNumbersForStoring(newNumbers) {
    var convertedNumbers = [[],[]];
    for(var i = 0; i < newNumbers.length;i++)
        for(var j = 0; j < newNumbers[i].length; j++)
            convertedNumbers[i][j] = newNumbers[i][j].toString();

    return convertedNumbers;
}

function readLotteryNumbers(config, session, response) {
    return config.readLotteryNumbers(session.user.userId).then(function(result) {
            if(result) {
                //always sort them before returning them (they might be unsorted!!!)
                return sortLotteryNumbers(result);
            }
            else {
                return [[[],[]]];
            }
        }).catch(function(error) {
            response.tell("Beim Lesen deiner Lottozahlen ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    });
}

function sortLotteryNumbers(lotteryNumbers) {
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
            tempArray[tempArray.length] = Number(lotteryNumbers[i][k]);
        }

        //sort by numbers
        tempArray = tempArray.sort((a, b) => a - b);

        //set array to index
        sortedLotteryArray[i] = [];

        //set numbers to new array and convert them to string to make it easier to compare and save
        for(var j = 0; j < tempArray.length; j++)
            sortedLotteryArray[i][j] = tempArray[j].toString();
    }

    return sortedLotteryArray;
}

function doLotteryNumberCheck(response, session, newNumber) {
    //noch keine superzahl -> checke auf range der main numbers
    if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain && (newNumber < 1 || newNumber > session.attributes.currentConfig.maxRangeMain))
        response.ask("Die Zahl darf nicht kleiner als 1 und nicht größer als 49 sein. Bitte wähle eine neue Zahl.","Bitte wähle eine neue Zahl.");
    //alle main numbers angegeben, checke auf range der additional numbers
    else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain && (newNumber < 1 || newNumber > session.attributes.currentConfig.maxRangeAdditional))
        response.ask("Die Superzahl darf nicht kleiner als 1 und nicht größer als 9 sein. Bitte wähle eine neue Zahl.", "Bitte wähle eine neue Zahl.")
    //prüfe ob eine main number oder eine additional number schon doppelt sind!
    else if((session.attributes.newNumbersMain.length <= session.attributes.currentConfig.numberCountMain -1 && session.attributes.newNumbersMain.indexOf(newNumber) != -1) ||
                (session.attributes.newNumbersAdditional.length <= session.attributes.currentConfig.numberCountAdditional-1 && session.attributes.newNumbersAdditional.indexOf(newNumber) != -1))
            response.ask("Du hast diese Zahl schon angegeben. Doppelte Zahlen sind nicht erlaubt. Bitte wähle eine neue Zahl.", "Bitte wähle eine neue Zahl.");
    else {
        console.log(newNumber);
        //zahl is valide, also füge sie hinzu!
        if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain)
            session.attributes.newNumbersMain[session.attributes.newNumbersMain.length] = newNumber;
        else
            session.attributes.newNumbersAdditional[session.attributes.newNumbersAdditional.length] = newNumber;

        console.log("Main: " + session.attributes.newNumbersMain + " Additional: " + session.attributes.newNumbersAdditional);

        //check ob weitere Zahlen hinzugefügt werden müssen
        if(lotteryFieldHasMaxLength(session)) {
            var speakOutput = "<speak>Danke. Deine Zahlen lauten: " + session.attributes.currentConfig.dbHelper.createSSMLOutputForField(session.attributes.newNumbersMain, session.attributes.newNumbersAdditional) + ". Ist das korrekt?</speak>";

            response.ask({type:"SSML",speech: speakOutput});

        } else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain) {
            //sort numbers and add superzahl behind!
            session.attributes.newNumbersMain = session.attributes.newNumbersMain.sort((a, b) => a - b);

            console.log("sorted: " + session.attributes.newNumbersMain);

            if(session.attributes.currentConfig.numberCountAdditional == 0) {
                response.ask("Wie lautet deine " + session.attributes.currentConfig.additionalNumberName + "?");
            } else {
                response.ask("Wie lautet deine " + session.attributes.newNumbersAdditional.length+1 + " " + session.attributes.currentConfig.additionalNumberName + "?");
            }
        } else {
            response.ask((session.attributes.newNumbersMain.length+1) + ". Zahl?", "Wie lautet deine " + (session.attributes.newNumbersMain.length+1) + ". Zahl?");
        }
    }
}

function getMatchingNumbers(gewinnZahlen, myNumbers) {    
    return gewinnZahlen.filter(n => myNumbers.indexOf(n) != -1);
}

function checkIntentStatus(session, response) {
    checkAddFieldIntent(session, response);
    checkRemoveNumbersIntent(session, response);
}

function checkAddFieldIntent(session, response) {
    if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
        response.ask("Tut mir leid, ich habe dich nicht richtig verstanden. Sage 'JA', um die Zahlen zu speichern, oder 'NEIN', um die Zahlen zu verwerfen.");
    } else if(session.attributes.isAddingField) {
        response.ask("Tut mir leid, ich habe die Zahl nicht richtig verstanden. Bitte wiederhole die Zahl oder sage abbrechen");
    }
}

function checkRemoveNumbersIntent(session, response) {
    if(session.attributes.isRemovingNumbers) {
        response.ask("Tut mir leid, ich habe dich nicht richtig verstanden. Sage 'JA', um die Zahlen zu löschen, oder 'NEIN', um die Zahlen nicht zu löschen.")
    }
}

function lotteryFieldHasMaxLength(session) {
    if(session.attributes.newNumbersMain && session.attributes.newNumbersAdditional)
        return (session.attributes.newNumbersMain.length + session.attributes.newNumbersAdditional.length) == (session.attributes.currentConfig.numberCountMain + session.attributes.currentConfig.numberCountMainAdditional);
    else
        return false;
}

function resetAllSessionAttributes(session) {
    session.attributes.isRemovingNumbers = false;
    session.attributes.isAddingField = false;
    session.attributes.currentConfig = "{}";
}