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
var language_properties = require('./language_properties_main');
var skillHelperPrototype = require('./SkillHelper');
var skillHelper;
var props = "";

/**
 * Lotto is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Lotto = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Lotto.prototype = Object.create(AlexaSkill.prototype);
Lotto.prototype.constructor = Lotto;

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Lotto skill.
    var lotto = new Lotto();

    var locale = event.request.locale

    if (locale == 'en-US')
        props = language_properties.getEnglishProperties();
    else if(locale == 'en-GB')
        props = language_properties.getEnglishProperties();
    else if(locale == 'en-IN')
        props = language_properties.getEnglishProperties();
    else
        props = language_properties.getGermanProperties();

    skillHelper = new skillHelperPrototype(locale);

    lotto.intentHandlers = Intent_Handler; //register intent handler

    lotto.execute(event, context);
};

Lotto.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Lotto onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Lotto.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    response.ask(props.welcome, props.welcome_reprompt);
};

Lotto.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Lotto onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

var Intent_Handler  = {
    // register custom intent handlers
    "HelloIntent": function (intent, session, response) {
        if(!checkIntentStatus(session,response)) return;

        response.ask(props.hello, props.hello_reprompt);
    },
    "NewNumber": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && intent.slots.lotteryNumber.value == "?") {
            checkWhatNumberIsNext(response, session, null, props.unknown_number);
        } else if(session.attributes.isAddingField && session.attributes.currentConfig && session.attributes.currentConfig.isZusatzLottery && intent.slots.lotteryNumber.value) {
            doZusatzLotteryNumberCheck(response, session, intent.slots.lotteryNumber.value);
        } else if(session.attributes.isAddingField && intent.slots.lotteryNumber.value && session.attributes.currentConfig && !session.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(response, session, intent.slots.lotteryNumber.value);
        } else if(intent.slots.lotteryNumber.value && !session.attributes.isAddingField) {
            response.ask(props.add_numbers);
        }else {
            response.ask(props.not_recognized_number);
        }
    },
    "ChangeLotteryNumberIntent": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && session.attributes.newNumbersMain && session.attributes.newNumbersMain.length > 0) {
            if(session.attributes.newNumbersAdditional.length == 0)
                session.attributes.newNumbersMain.pop();
            else
                session.attributes.newNumbersAdditional.pop();

            checkWhatNumberIsNext(response, session, null, props.corrected_number);
        } else if(session.attributes.isAddingField && (!session.attributes.newNumbers || session.attributes.newNumbers.length == 0)) {
            response.ask(props.add_number_before_changing);
        } else if(!session.attributes.isAddingField) {
            response.ask(props.add_numbers);
        } else {
            response.ask(props.you_are_wrong_here);
        }
    },
    "AddLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            setUpForNewField(session, intent.slots.lotteryName.value);
            var speechStart = props.speech_first_part + session.attributes.currentConfig.speechLotteryName + props.speech_second_part;
            if(session.attributes.currentConfig.isZusatzLottery)
                response.ask(speechStart + props.speech_third_part_additional_lottery, props.add_lottery_number_reprompt);
            else
                response.ask(speechStart + props.speech_third_part_normal, props.add_lottery_number_reprompt);
        } else {
            response.ask(props.unknown_lottery);
        }
    },
    "RemoveLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            session.attributes.isRemovingNumbers = true;
            response.ask(props.remove_first_part + session.attributes.currentConfig.speechLotteryName + props.remove_second_part);
        } else {
             response.ask(props.unknown_lottery);
        }
    },
    "AMAZON.YesIntent": function (intent, session, response) {

        if(session.attributes.addToSuper6 && session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //also add spiel77 number to super6
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSuper6LotteryName());
            session.attributes.addToSpiel77 = true;
            saveNewLottoNumbers(session, response);
        } else if(session.attributes.addToSpiel77 && session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //also add super6 to spiel77
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSpiel77LotteryName());
            session.attributes.addToSuper6 = true;
            saveNewLottoNumbers(session, response);
        } else if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //add new field
            saveNewLottoNumbers(session, response);
        } else if (session.attributes.isRemovingNumbers && session.attributes.currentConfig) {
            //remove all numbers
            skillHelper.getLotteryDbHelper(session.attributes.currentConfig.lotteryName).removeLotteryNumbers(session.user.userId).then(function(result) {
                if(result) {
                    response.tell(props.remove_first_part + session.attributes.currentConfig.speechLotteryName + props.remove_success);
                }
            }).catch(function(error) {
                response.tell(props.remove_error);
            });
        } else {
            if(!checkAddFieldIntent(session, response)) return;
            
            response.ask(props.you_are_wrong_here);
        }
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        if(session.attributes.addToSuper6 || session.attributes.addToSpiel77) {
            response.tell(props.ok);
        } else if(session.attributes.isAddingField && session.attributes.isZusatzLottery && lotteryFieldHasMaxLength(session)) {
            response.tell(props.ticket_number_saved);
        } else if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            response.tell(props.ok_your + session.attributes.currentConfig.speechLotteryName + props.numbers_not_saved);
        } else if(session.attributes.isRemovingNumbers) {
            response.tell(props.ok_your + session.attributes.currentConfig.speechLotteryName + props.numbers_not_deleted);
        } else {
            if(!checkAddFieldIntent(session, response)) return;

            response.ask(props.you_are_wrong_here);
        }
    },
    "AskForLotteryWinIntent": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            session.attributes.currentConfig = config;

            readLotteryNumbers(session, response).then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                        if(lotteryNumbersAndDate) {
                            //check how many matches we have with the given numbers!
                            var rank = skillHelper.getRank(session, lotteryNumbersAndDate, myNumbers);

                            skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                                var moneySpeech = ""
                                if(money && money.length > 0)
                                    moneySpeech = props.amount_you_won + money + " " + lotteryNumbersAndDate[3];
                                else
                                    moneySpeech = props.no_amount_set_yet;
                                    
                                var speechOutput = skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutput(rank, moneySpeech, lotteryNumbersAndDate[2]);

                                if(session.attributes.currentConfig.lotteryName == skillHelper.getGermanLotteryName()) {
                                    checkForSpiel77(session, response, speechOutput);
                                } else if(session.attributes.currentConfig.lotteryName == skillHelper.getAustrianLotteryName()) {
                                    checkForJoker(session, response, speechOutput);
                                } else {
                                    speechOutput += "<break time=\"200ms\"/>" + props.without_guarantee + "</speak>";
                                    response.tell({type:"SSML",speech: speechOutput});
                                }
                            }).catch(function(err) {
                                response.tell(props.last_drawing_request_failed);    
                            });
                        } else {
                            response.tell(props.last_drawing_request_failed);
                        }
                    });
                }
                else {
                    response.ask(props.add_numbers_before_asking_for_win_1 + config.speechLotteryName + props.add_numbers_before_asking_for_win_2 + config.speechLotteryName);
                }
            });
        } else {
            response.ask(props.unknown_lottery);
        }
    },
    //"AskForLotteryWinOverAll": function (intent, session, response) {
    //    checkIntentStatus(session,response);
    //    skillHelper.generateOverAllWinOutput(session, response);
    //},
    "MyCurrentNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            session.attributes.currentConfig = config;

            readLotteryNumbers(session, response).then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    var speakOutput = "<speak>"+ props.current_numbers_1 + config.speechLotteryName + props.current_numbers_2 + "<break time=\"200ms\"/>";

                    for(var i = 0; i < myNumbers.length; i++) {
                        speakOutput += (myNumbers.length > 1 ? (session.attributes.currentConfig.isZusatzLottery ? props.current_numbers_lottery_ticket_number : props.current_numbers_field) + (i+1) : "") + ": <break time=\"500ms\"/>";
                        speakOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(myNumbers[i]);
                        speakOutput += ". ";
                    }
                    speakOutput += "</speak>";

                    response.tell({type:"SSML",speech: speakOutput});

                } else {
                    response.ask(props.current_numbers_no_numbers_1 + config.speechLotteryName + props.current_numbers_no_numbers_2 + config.speechLotteryName + props.current_numbers_no_numbers_3);
                }
            });
        } else {
            response.ask(props.unknown_lottery);
        }
    },
    "AskForLatestLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getLastLotteryDateAndNumbers().then(function(numbers) {
                if(numbers) {
                    var speakOutput = "<speak>" + props.latest_lottery_drawing_numbers + config.speechLotteryName + props.latest_lottery_numbers_from + numbers[2] + ". <break time=\"500ms\"/>";
                    speakOutput += skillHelper.getLotteryApiHelper(config.lotteryName).createSSMLOutputForNumbers(numbers);
                    speakOutput += ". <break time=\"200ms\"/>" + props.without_guarantee + "</speak>";

                    response.tell({type:"SSML",speech: speakOutput});
                } else {
                    response.tell(props.last_drawing_request_failed);
                }
            });
        }
        else {
            response.ask(props.unknown_lottery);
        }
     },
     "AskForLotteryJackpot": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getCurrentJackpot().then(function(jackpotSize) {
                if(jackpotSize && jackpotSize > 0) {
                    response.tell(props.current_jackpot_size_1 + config.speechLotteryName + props.current_jackpot_size_2 + (skillHelper.isGermanLang() ? (jackpotSize+"").replace('.',',') : jackpotSize) + props.current_jackpot_size_3);
                } else if(jackpotSize) {
                    response.tell(jackpotSize);
                } else {
                    response.tell(props.current_jackpot_size_error);
                }
            });
        }
        else {
            response.ask(props.unknown_lottery);
        }
     },
     "AskForNextLotteryDrawing": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getNextLotteryDrawingDate().then(function(nextDrawing) {
                if(nextDrawing) {
                    response.tell(props.next_drawing_1 + config.speechLotteryName + props.next_drawing_2 + nextDrawing);
                } else {
                    response.tell(props.next_drawing_failed);
                }
            });
        }
        else {
            response.ask(props.unknown_lottery);
        }
     },
     "SupportedLotteries": function (intent, session, response) {
         if(!checkIntentStatus(session, response)) return;

         response.ask(props.supportet_lotteries);
     },
     "NullNumberIntent": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && session.attributes.currentConfig && session.attributes.currentConfig.isZusatzLottery) {
            doZusatzLotteryNumberCheck(response, session, 0);
        } else if(session.attributes.isAddingField && session.attributes.currentConfig && !session.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(response, session, 0);
        } else if(!session.attributes.isAddingField) {
            response.ask(props.null_number_intent_error_1)
        }else {
            response.ask(props.null_number_intent_error_2);
        }
     },
     "EndIntent": function (intent, session, response) {
         response.tell(props.goodbye_intent);
     },
     "ThanksIntent": function (intent, session, response) {
         if(!checkIntentStatus(session, response)) return;

         response.tell(props.thanks_intent);
     },
    "AMAZON.HelpIntent": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        var help = props.help_intent_help_line;
        var repromt = props.help_intent_repromt_line;
        var cardTitle = props.help_intent_card_title_line;
        var cardContent = props.help_intent_card_content_line;
        
        response.askWithCard(help, repromt, cardTitle, cardContent);
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        response.tell(props.goodbye_intent);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        response.tell(props.goodbye_intent);
    },
    "TestIntent": function (intent, session, response) {
        var germanNumbers = [[["10","20","13","40","15","26"],["7", "1"]],[["49","21","13","31","15","1"],["2","8"]]];
        var tippscheinNummer = ["10","9","8"];

        setUpForNewField(session, skillHelper.getGermanZusatzLotteryName());
        session.attributes.newNumbersMain = ["9","8","7","6","5","4","3"];

        console.log("try to save numbers:" + session.attributes.newNumbersMain);
        //saveNewLottoNumbers(session, response);
        readLotteryNumbers(session, response).then(function(myNumbers) {
            console.log("Read:" + myNumbers);
        });
    }
};

function setUpForNewField(session, lotteryName) {
    session.attributes.isAddingField = true;
    session.attributes.newNumbersMain = [];
    session.attributes.newNumbersAdditional = [];
    session.attributes.currentConfig = skillHelper.getConfigByUtterance(lotteryName);
}

function saveNewLottoNumbers(session, response) {
    if(lotteryFieldHasMaxLength(session)) {
        readLotteryNumbers(session , response).then(function(oldNumbers) {
            //convert numbers from int to string
            var newNumbers = [];
            newNumbers[0] = session.attributes.newNumbersMain;
            newNumbers[1] = session.attributes.newNumbersAdditional;

            var convertedNumbers = skillHelper.convertNewNumbersForStoring(newNumbers);
            //set new numbers at the end of all numbers
            oldNumbers[oldNumbers.length] = convertedNumbers;

            skillHelper.getLotteryDbHelper(session.attributes.currentConfig.lotteryName).updateLotteryNumbers(session.user.userId , oldNumbers).then(function(result) {
                if(result) {
                    if(session.attributes.currentConfig.lotteryName == skillHelper.getSpiel77LotteryName() && !session.attributes.addToSuper6) {
                        session.attributes.addToSuper6 = true;
                        response.ask(getSaveSpeechOutput(session) + props.save_new_numbers_ask_super6);
                    } else if(session.attributes.currentConfig.lotteryName == skillHelper.getSuper6LotteryName() && !session.attributes.addToSpiel77) {
                        session.attributes.addToSpiel77 = true;
                        response.ask(getSaveSpeechOutput(session) + props.save_new_numbers_ask_spiel77);
                    } else {
                        if(session.attributes.currentConfig.isZusatzLottery)
                            response.tell(getSaveSpeechOutput(session));
                        else
                            response.tell(getSaveSpeechOutput(session));
                    }
                } else {
                    response.tell(props.save_new_numbers_failed)
                }
            });
        });
    }
}

function getSaveSpeechOutput(session, isZusatzLottery) {
    if(session.attributes.currentConfig.isZusatzLottery)
        return props.speech_output_saved_lottery_ticket_number + session.attributes.currentConfig.speechLotteryName + props.speech_output_successfully_saved;
    else
        return props.speech_output_saved_lottery_numbers + session.attributes.currentConfig.speechLotteryName + props.speech_output_successfully_saved;
}

function readLotteryNumbers(session, response) {
    return skillHelper.getLotteryDbHelper(session.attributes.currentConfig.lotteryName).readLotteryNumbers(session.user.userId).then(function(result) {
            if(result) {
                if(result.length > 0) {
                    if(session.attributes.currentConfig.isZusatzLottery)
                        return result;
                    else
                        return skillHelper.sortLotteryNumbers(result);
                }
                else
                    return [];
            }
            else {
                return [];
            }
        }).catch(function(error) {
            console.log(error);
            return [];
            //response.tell("Beim Lesen deiner Lottozahlen ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    });
}

function doLotteryNumberCheck(response, session, newNumber) {
    if(newNumber%1 != 0)
        response.ask(props.just_whole_numbers_allowed, props.range_check_numbers_repromt);

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);

    //noch keine additional numbers -> checke auf range der main numbers
    if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeMain || newNumber > session.attributes.currentConfig.maxRangeMain))
        response.ask(props.range_check_main_numbers_1 + session.attributes.currentConfig.minRangeMain + props.range_check_main_numbers_2 + session.attributes.currentConfig.maxRangeMain + props.range_check_main_numbers_3, props.range_check_numbers_repromt);
    //alle main numbers angegeben, checke auf range der additional numbers
    else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeAdditional || newNumber > session.attributes.currentConfig.maxRangeAdditional))
        response.ask(skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getCorrectArticle() + session.attributes.currentConfig.additionalNumberName + props.range_check_additional_number_2 + session.attributes.currentConfig.minRangeAdditional + props.range_check_additional_number_3 + session.attributes.currentConfig.maxRangeAdditional + props.range_check_additional_number_4, props.range_check_numbers_repromt)
    //prüfe ob eine main number oder eine additional number schon doppelt sind!
    else if((session.attributes.newNumbersMain.length <= session.attributes.currentConfig.numberCountMain -1 && session.attributes.newNumbersMain.indexOf(newNumber) != -1) ||
                (session.attributes.newNumbersAdditional.length <= session.attributes.currentConfig.numberCountAdditional-1 && session.attributes.newNumbersAdditional.indexOf(newNumber) != -1))
            response.ask(props.check_duplicate_number, props.range_check_numbers_repromt);
    else {
        //zahl is valide, also füge sie hinzu!
        if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain)
            session.attributes.newNumbersMain.push(newNumber);
        else
            session.attributes.newNumbersAdditional.push(newNumber);

    checkWhatNumberIsNext(response, session, newNumber, "");
    
    }
}

function checkWhatNumberIsNext(response, session, newNumber, additionalSpeechInfo) {
    //check ob weitere Zahlen hinzugefügt werden müssen
    if(lotteryFieldHasMaxLength(session)) {
        var numbers = [];
        numbers[0] = session.attributes.newNumbersMain.slice(0);
        numbers[1] = session.attributes.newNumbersAdditional.slice(0);
        //sort numbers for speech output!
        if(!session.attributes.currentConfig.isZusatzLottery)
            numbers[0] = numbers[0].sort((a, b) => a - b);

        numbers[1] = numbers[1].sort((a, b) => a - b);

        var speakOutput = "<speak>" + props.check_next_number_current_numbers;

        speakOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(numbers);
        speakOutput += props.check_next_number_ask_correct + "</speak>";
        response.ask({type:"SSML",speech: speakOutput}, props.check_next_number_ask_correct_all_numbers);

    } else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain) {

        var outPut = skillHelper.getCorrectPreWordAdditionalNumber(session.attributes.currentConfig.lotteryName) + 
                            (session.attributes.currentConfig.numberCountAdditional > 1 ? skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersAdditional.length + 1)) : "") + " " 
                            + session.attributes.currentConfig.additionalNumberName + "?";

        if(newNumber) {
            var speechOutputPost = props.check_next_number_ask_next_number_start_1 + outPut;
            var speechOutput = "<speak>" + newNumber + "<break time=\"200ms\"/>" + speechOutputPost + "</speak>";

            response.ask({type: "SSML", speech: speechOutput}, speechOutputPost);
        } else {
            response.ask(additionalSpeechInfo + outPut);
        }
    } else {
        if(newNumber || newNumber == 0) {
            var speechOutput = "<speak>" + (newNumber == 0 ? props.check_next_number_is_zero : newNumber)+ "<break time=\"200ms\"/>" + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + props.check_next_number_ask_for_number +"</speak>"
            response.ask({type: "SSML", speech: speechOutput}, props.check_next_number_ask_next_number_start_2 + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + props.check_next_number_ask_for_number);
        } else {
            response.ask(additionalSpeechInfo + props.check_next_number_your + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + props.check_next_number_ask_for_number, props.check_next_number_ask_next_number_start_2 + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + props.check_next_number_ask_for_number);
        }
    }
}

function doZusatzLotteryNumberCheck(response, session, newNumber) {
    if(newNumber%1 != 0)
        response.ask(props.just_whole_numbers_allowed, props.range_check_numbers_repromt);

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);
    
    //noch keine additional numbers -> checke auf range der main numbers
    if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeMain || newNumber > session.attributes.currentConfig.maxRangeMain))
        response.ask(props.range_check_main_numbers_1 + session.attributes.currentConfig.minRangeMain + props.range_check_main_numbers_2 + session.attributes.currentConfig.maxRangeMain + props.range_check_main_numbers_3, props.range_check_numbers_repromt);
    else {
        //zahl is valide, also füge sie hinzu!
        if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain)
            session.attributes.newNumbersMain.push(newNumber);

        checkWhatNumberIsNext(response, session, newNumber, "");
    }
}

function checkIntentStatus(session, response) {
    if(!checkAddFieldIntent(session, response))
        return false;
    
    return checkRemoveNumbersIntent(session, response);
}

function checkAddFieldIntent(session, response) {
    if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
        response.ask(props.check_add_field_misunderstood_yes_no);
        return false;
    } else if(session.attributes.isAddingField) {
        response.ask(props.check_add_field_misunderstood_number);
        return false;
    }

    return true;
}

function checkRemoveNumbersIntent(session, response) {
    if(session.attributes.isRemovingNumbers) {
        response.ask(props.check_remove_numbers_yes_no)
        return false;
    }
    return true;
}

function lotteryFieldHasMaxLength(session) {
    if(session.attributes.newNumbersMain && session.attributes.newNumbersAdditional)
        return (session.attributes.newNumbersMain.length + session.attributes.newNumbersAdditional.length) == (session.attributes.currentConfig.numberCountMain + session.attributes.currentConfig.numberCountAdditional);
    else
        return false;
}

function checkForSpiel77(session, response, speechOutput) {
    session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSpiel77LotteryName());

    readLotteryNumbers(session, response).then(function(mySpiel77Numbers) {
        if(mySpiel77Numbers && mySpiel77Numbers.length > 0) {
            skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(session, lotteryNumbersAndDate, mySpiel77Numbers);

                    skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = props.amount_you_won + money;
                        else
                            moneySpeech = props.no_amount_set_yet;
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        appendSuper6Win(session, response, speechOutput);

                    }).catch(function(err) {
                        response.tell(props.last_drawing_request_failed);    
                    });
                } else {
                    response.tell(props.last_drawing_request_failed);
                }
            });
        } else {
            appendSuper6Win(session, response, speechOutput);
        }
    });
}

function appendSuper6Win(session, response, speechOutput) {
    session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSuper6LotteryName());

    readLotteryNumbers(session, response).then(function(mySuper6Numbers) {
        if(mySuper6Numbers && mySuper6Numbers.length > 0) {
            skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(session, lotteryNumbersAndDate, mySuper6Numbers);

                    skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = props.amount_you_won + money;
                        else
                            moneySpeech = props.no_amount_set_yet;
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + props.without_guarantee + "</speak>";
                        response.tell({type:"SSML",speech: speechOutput});
                    }).catch(function(err) {
                        response.tell(props.last_drawing_request_failed);    
                    });
                } else {
                    response.tell(props.last_drawing_request_failed);
                }
            });
        } else {
            speechOutput += "<break time=\"200ms\"/>" + props.without_guarantee + "</speak>";
            response.tell({type:"SSML",speech: speechOutput});
        }
    });
}

function checkForJoker(session, response, speechOutput) {    
    session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getJokerLotteryName());

    readLotteryNumbers(session, response).then(function(myJokerNumbers) {
        if(myJokerNumbers && myJokerNumbers.length > 0) {
            skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(session, lotteryNumbersAndDate, myJokerNumbers);

                    skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = props.amount_you_won + money;
                        else
                            moneySpeech = props.no_amount_set_yet;
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + props.without_guarantee + "</speak>";
                        response.tell({type:"SSML",speech: speechOutput});
                    }).catch(function(err) {
                        response.tell(props.last_drawing_request_failed);    
                    });
                } else {
                    response.tell(props.last_drawing_request_failed);
                }
            });
        } else {
            speechOutput += "<break time=\"200ms\"/>" + props.without_guarantee + "</speak>";
            response.tell({type:"SSML",speech: speechOutput});
        }
    });
}