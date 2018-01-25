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
var AlexaSkill = require('alexa-sdk');
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

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Lotto skill.
    var lotto = Alexa.handler(event, context);
    lotto.appId = APP_ID;
    lotto.resources = language_properties.getLanguageProperties();
    lotto.registerHandlers(intent_Handler);
    lotto.execute();

    var locale = event.request.locale;
    skillHelper = new skillHelperPrototype(locale);
};

var intent_Handler  = {
    "LaunchRequest": function () {
        this.response.speak(this.t('welcome')).listen(this.t('welcome_reprompt'));
        this.emit(':responseReady');
    },
    // register custom intent handlers
    "HelloIntent": function (intent, session, response) {
        if(!checkIntentStatus(session,response)) return;

        this.response.speak(this.t('hello')).listen(this.t('hello_reprompt'));
        this.emit(':responseReady');
    },
    "NewNumber": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && intent.slots.lotteryNumber.value == "?") {
            checkWhatNumberIsNext(response, session, null, this.t('unknown_number'));
        } else if(session.attributes.isAddingField && session.attributes.currentConfig && session.attributes.currentConfig.isZusatzLottery && intent.slots.lotteryNumber.value) {
            doZusatzLotteryNumberCheck(response, session, intent.slots.lotteryNumber.value);
        } else if(session.attributes.isAddingField && intent.slots.lotteryNumber.value && session.attributes.currentConfig && !session.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(response, session, intent.slots.lotteryNumber.value);
        } else if(intent.slots.lotteryNumber.value && !session.attributes.isAddingField) {
            this.response.speak(this.t('add_numbers')).listen();
            this.emit(':responseReady');
        }else {
            this.response.speak(this.t('not_recognized_number')).listen();
            this.emit(':responseReady');
        }
    },
    "ChangeLotteryNumberIntent": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && session.attributes.newNumbersMain && session.attributes.newNumbersMain.length > 0) {
            if(session.attributes.newNumbersAdditional.length == 0)
                session.attributes.newNumbersMain.pop();
            else
                session.attributes.newNumbersAdditional.pop();

            checkWhatNumberIsNext(response, session, null, this.t('corrected_number'));
        } else if(session.attributes.isAddingField && (!session.attributes.newNumbers || session.attributes.newNumbers.length == 0)) {
            this.response.speak(this.t('add_number_before_changing')).listen();
            this.emit(':responseReady');
        } else if(!session.attributes.isAddingField) {
            this.response.speak(this.t('add_numbers')).listen();
            this.emit(':responseReady');
        } else {
            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
        }
    },
    "AddLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            setUpForNewField(session, intent.slots.lotteryName.value);
            var speechStart = this.t('speech_first_part') + session.attributes.currentConfig.speechLotteryName + this.t('speech_second_part');
            if(session.attributes.currentConfig.isZusatzLottery) {
                this.response.speak(speechStart + this.t('speech_third_part_additional_lottery')).listen(this.t('add_lottery_number_reprompt'));
                this.emit(':responseReady');
            } else {
                this.response.speak(speechStart + this.t('speech_third_part_normal')).listen(this.t('add_lottery_number_reprompt'));
                this.emit(':responseReady');
            }
        } else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
    },
    "RemoveLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            session.attributes.isRemovingNumbers = true;
            this.response.speak(this.t('remove_first_part') + session.attributes.currentConfig.speechLotteryName + this.t('remove_second_part')).listen();
            this.emit(':responseReady');
        } else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
    },
    "AMAZON.YesIntent": function (intent, session, response) {

        if(session.attributes.addToSuper6 && session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //also add spiel77 number to super6
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSuper6LotteryName());
            session.attributes.addToSpiel77 = true;
            saveNewLottoNumbers(session, this.response);
        } else if(session.attributes.addToSpiel77 && session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //also add super6 to spiel77
            session.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSpiel77LotteryName());
            session.attributes.addToSuper6 = true;
            saveNewLottoNumbers(session, this.response);
        } else if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            //add new field
            saveNewLottoNumbers(session, response);
        } else if (session.attributes.isRemovingNumbers && session.attributes.currentConfig) {
            //remove all numbers
            skillHelper.getLotteryDbHelper(session.attributes.currentConfig.lotteryName).removeLotteryNumbers(session.user.userId).then(function(result) {
                if(result) {
                    this.response.speak(this.t('remove_first_part') + session.attributes.currentConfig.speechLotteryName + this.t('remove_success'));
                    this.emit(':responseReady');
                }
            }).catch(function(error) {
                this.response.speak(this.t('remove_error'));
                this.emit(':responseReady');
            });
        } else {
            if(!checkAddFieldIntent(session, response)) return;
            
            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
        }
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        if(session.attributes.addToSuper6 || session.attributes.addToSpiel77) {
            this.response.speak('ok');
            this.emit(':responseReady');
        } else if(session.attributes.isAddingField && session.attributes.isZusatzLottery && lotteryFieldHasMaxLength(session)) {
            this.response.speak(this.t('ticket_number_saved'));
            this.emit(':responseReady');
        } else if(session.attributes.isAddingField && lotteryFieldHasMaxLength(session)) {
            this.response.speak(this.t('ok_your') + session.attributes.currentConfig.speechLotteryName + this.t('numbers_not_saved'));
            this.emit(':responseReady');
        } else if(session.attributes.isRemovingNumbers) {
            this.response.speak(this.t('ok_your') + session.attributes.currentConfig.speechLotteryName + this.t('numbers_not_deleted'));
            this.emit(':responseReady');
        } else {
            if(!checkAddFieldIntent(session, response)) return;

            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
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
                                    moneySpeech = this.t('amount_you_won') + money + " " + lotteryNumbersAndDate[3];
                                else
                                    moneySpeech = this.t('no_amount_set_yet');
                                    
                                var speechOutput = skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutput(rank, moneySpeech, lotteryNumbersAndDate[2]);

                                if(session.attributes.currentConfig.lotteryName == skillHelper.getGermanLotteryName()) {
                                    checkForSpiel77(session, response, speechOutput);
                                } else if(session.attributes.currentConfig.lotteryName == skillHelper.getAustrianLotteryName()) {
                                    checkForJoker(session, response, speechOutput);
                                } else {
                                    speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";
                                    this.response.speak(speechOutput);
                                    this.emit(':responseReady');
                                }
                            }).catch(function(err) {
                                this.response.speak(this.t('last_drawing_request_failed'));
                                this.emit(':responseReady');
                            });
                        } else {
                            this.response.speak(this.t('last_drawing_request_failed'));
                            this.emit(':responseReady');
                        }
                    });
                }
                else {
                    this.response.speak(this.t('add_numbers_before_asking_for_win_1') + config.speechLotteryName + this.t('add_numbers_before_asking_for_win_2') + config.speechLotteryName).listen();
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
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
                    var speakOutput = "<speak>"+ this.t('current_numbers_1') + config.speechLotteryName + this.t('current_numbers_2') + "<break time=\"200ms\"/>";

                    for(var i = 0; i < myNumbers.length; i++) {
                        speakOutput += (myNumbers.length > 1 ? (session.attributes.currentConfig.isZusatzLottery ? this.t('current_numbers_lottery_ticket_number') : this.t('current_numbers_field')) + (i+1) : "") + ": <break time=\"500ms\"/>";
                        speakOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(myNumbers[i]);
                        speakOutput += ". ";
                    }
                    speakOutput += "</speak>";

                    this.response.speak(speakOutput);
                    this.emit(':responseReady');
                } else {
                    this.response.speak(this.t('current_numbers_no_numbers_1') + config.speechLotteryName + this.t('current_numbers_no_numbers_2') + config.speechLotteryName + this.t('current_numbers_no_numbers_3')).listen();
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
    },
    "AskForLatestLotteryNumbers": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getLastLotteryDateAndNumbers().then(function(numbers) {
                if(numbers) {
                    var speakOutput = "<speak>" + this.t('latest_lottery_drawing_numbers') + config.speechLotteryName + this.t('latest_lottery_numbers_from') + numbers[2] + ". <break time=\"500ms\"/>";
                    speakOutput += skillHelper.getLotteryApiHelper(config.lotteryName).createSSMLOutputForNumbers(numbers);
                    speakOutput += ". <break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";

                    this.response.speak(speakOutput);
                    this.emit(':responseReady');
                } else {
                    this.response.speak(this.t('last_drawing_request_failed'));
                    this.emit(':responseReady');
                }
            });
        }
        else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
     },
     "AskForLotteryJackpot": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getCurrentJackpot().then(function(jackpotSize) {
                if(jackpotSize && jackpotSize > 0) {
                    this.response.speak(this.t('current_jackpot_size_1') + config.speechLotteryName + this.t('current_jackpot_size_2') + (skillHelper.isGermanLang() ? (jackpotSize+"").replace('.',',') : jackpotSize) + this.t('current_jackpot_size_3'));
                    this.emit(':responseReady');
                } else if(jackpotSize) {
                    this.response.speak(jackpotSize);
                    this.emit(':responseReady');
                } else {
                    this.response.speak(this.t('current_jackpot_size_error'));
                    this.emit(':responseReady');
                }
            });
        }
        else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
     },
     "AskForNextLotteryDrawing": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        if(intent.slots.lotteryName.value && skillHelper.isLotteryNameSupported(intent.slots.lotteryName.value)) {
            var config = skillHelper.getConfigByUtterance(intent.slots.lotteryName.value);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getNextLotteryDrawingDate().then(function(nextDrawing) {
                if(nextDrawing) {
                    this.response.speak(this.t('next_drawing_1') + config.speechLotteryName + this.t('next_drawing_2') + nextDrawing);
                    this.emit(':responseReady');
                } else {
                    this.response.speak(this.t('next_drawing_failed'));
                    this.emit(':responseReady');
                }
            });
        }
        else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
     },
     "SupportedLotteries": function (intent, session, response) {
         if(!checkIntentStatus(session, response)) return;

         this.response.speak(this.t('supportet_lotteries')).listen();
         this.emit(':responseReady');
     },
     "NullNumberIntent": function (intent, session, response) {
        if(!checkRemoveNumbersIntent(session, response)) return;

        if(session.attributes.isAddingField && session.attributes.currentConfig && session.attributes.currentConfig.isZusatzLottery) {
            doZusatzLotteryNumberCheck(response, session, 0);
        } else if(session.attributes.isAddingField && session.attributes.currentConfig && !session.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(response, session, 0);
        } else if(!session.attributes.isAddingField) {
            this.response.speak(this.t('null_number_intent_error_1')).listen();
            this.emit(':responseReady');
        }else {
            this.response.speak(this.t('null_number_intent_error_2')).listen();
            this.emit(':responseReady');
        }
     },
     "EndIntent": function (intent, session, response) {
         this.response.speak(this.t('goodbye_intent'));
         this.emit(':responseReady');
     },
     "ThanksIntent": function (intent, session, response) {
         if(!checkIntentStatus(session, response)) return;

         this.response.speak(this.t('thanks_intent'));
         this.emit(':responseReady');
     },
    "AMAZON.HelpIntent": function (intent, session, response) {
        if(!checkIntentStatus(session, response)) return;

        var help = this.t('help_intent_help_line');
        var repromt = this.t('help_intent_repromt_line');
        var cardTitle = this.t('help_intent_card_title_line');
        var cardContent = this.t('help_intent_card_content_line');
        
        this.response.speak(help).listen(repromt).cardRenderer(cardTitle, cardContent, null);
        this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        this.response.speak(this.t('goodbye_intent'));
        this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        this.response.speak(this.t('goodbye_intent'));
        this.emit(':responseReady');
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
                        this.response.speak(getSaveSpeechOutput(session) + this.t('save_new_numbers_ask_super6'));
                        this.emit(':responseReady');
                    } else if(session.attributes.currentConfig.lotteryName == skillHelper.getSuper6LotteryName() && !session.attributes.addToSpiel77) {
                        session.attributes.addToSpiel77 = true;
                        this.response.speak(getSaveSpeechOutput(session) + this.t('save_new_numbers_ask_spiel77'));
                        this.emit(':responseReady');
                    } else {
                        if(session.attributes.currentConfig.isZusatzLottery) {
                            this.response.speak(getSaveSpeechOutput(session));
                            this.emit(':responseReady');
                        } else {
                            this.response.speak(getSaveSpeechOutput(session));
                            this.emit(':responseReady');
                        }
                    }
                } else {
                    this.response.speak(this.t('save_new_numbers_failed'));
                    this.emit(':responseReady');
                }
            });
        });
    }
}

function getSaveSpeechOutput(session, isZusatzLottery) {
    if(session.attributes.currentConfig.isZusatzLottery)
        return this.t('speech_output_saved_lottery_ticket_number') + session.attributes.currentConfig.speechLotteryName + this.t('speech_output_successfully_saved');
    else
        return this.t('speech_output_saved_lottery_numbers') + session.attributes.currentConfig.speechLotteryName + this.t('speech_output_successfully_saved');
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
            //this.response.speak("Beim Lesen deiner Lottozahlen ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    });
}

function doLotteryNumberCheck(response, session, newNumber) {
    if(newNumber%1 != 0)
        this.response.speak(this.t('just_whole_numbers_allowed')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);

    //noch keine additional numbers -> checke auf range der main numbers
    if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeMain || newNumber > session.attributes.currentConfig.maxRangeMain)) {
        this.response.speak(this.t('range_check_main_numbers_1') + session.attributes.currentConfig.minRangeMain + this.t('range_check_main_numbers_2') + session.attributes.currentConfig.maxRangeMain + this.t('range_check_main_numbers_3')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    //alle main numbers angegeben, checke auf range der additional numbers
    } else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeAdditional || newNumber > session.attributes.currentConfig.maxRangeAdditional)) {
        this.response.speak(skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).getCorrectArticle() + session.attributes.currentConfig.additionalNumberName + this.t('range_check_additional_number_2') + session.attributes.currentConfig.minRangeAdditional + this.t('range_check_additional_number_3') + session.attributes.currentConfig.maxRangeAdditional + this.t('range_check_additional_number_4')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    //prüfe ob eine main number oder eine additional number schon doppelt sind!
    } else if((session.attributes.newNumbersMain.length <= session.attributes.currentConfig.numberCountMain -1 && session.attributes.newNumbersMain.indexOf(newNumber) != -1) ||
                (session.attributes.newNumbersAdditional.length <= session.attributes.currentConfig.numberCountAdditional-1 && session.attributes.newNumbersAdditional.indexOf(newNumber) != -1)) {
            this.response.speak(this.t('check_duplicate_number')).listen(this.t('range_check_numbers_repromt'));
            this.emit(':responseReady');
    } else {
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

        var speakOutput = "<speak>" + this.t('check_next_number_current_numbers');

        speakOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(numbers);
        speakOutput += this.t('check_next_number_ask_correct') + "</speak>";
        this.response.speak(speakOutput).listen(this.t('check_next_number_ask_correct_all_numbers'));
        this.emit(':responseReady');

    } else if(session.attributes.newNumbersMain.length == session.attributes.currentConfig.numberCountMain) {

        var outPut = skillHelper.getCorrectPreWordAdditionalNumber(session.attributes.currentConfig.lotteryName) + 
                            (session.attributes.currentConfig.numberCountAdditional > 1 ? skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersAdditional.length + 1)) : "") + " " 
                            + session.attributes.currentConfig.additionalNumberName + "?";

        if(newNumber) {
            var speechOutputPost = this.t('check_next_number_ask_next_number_start_1') + outPut;
            var speechOutput = "<speak>" + newNumber + "<break time=\"200ms\"/>" + speechOutputPost + "</speak>";

            this.response.speak(speechOutput).listen(speechOutputPost);
            this.emit(':responseReady');
        } else {
            this.response.speak(additionalSpeechInfo + outPut).listen();
            this.emit(':responseReady');
        }
    } else {
        if(newNumber || newNumber == 0) {
            var speechOutput = "<speak>" + (newNumber == 0 ? this.t('check_next_number_is_zero') : newNumber)+ "<break time=\"200ms\"/>" + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number') +"</speak>"
            this.response.speak(speechOutput).listen(this.t('check_next_number_ask_next_number_start_2') + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number'));
            this.emit(':responseReady');
        } else {
            this.response.speak(additionalSpeechInfo + this.t('check_next_number_your') + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number')).listen(this.t('check_next_number_ask_next_number_start_2') + skillHelper.getCorrectNamingOfNumber((session.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number'));
            this.emit(':responseReady');
        }
    }
}

function doZusatzLotteryNumberCheck(response, session, newNumber) {
    if(newNumber%1 != 0)
        this.response.speak(this.t('just_whole_numbers_allowed')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);
    
    //noch keine additional numbers -> checke auf range der main numbers
    if(session.attributes.newNumbersMain.length < session.attributes.currentConfig.numberCountMain && (newNumber < session.attributes.currentConfig.minRangeMain || newNumber > session.attributes.currentConfig.maxRangeMain)) {
        this.response.speak(this.t('range_check_main_numbers_1') + session.attributes.currentConfig.minRangeMain + this.t('range_check_main_numbers_2') + session.attributes.currentConfig.maxRangeMain + this.t('range_check_main_numbers_3')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    } else {
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
        this.response.speak(this.t('check_add_field_misunderstood_yes_no')).listen();
        this.emit(':responseReady');
        return false;
    } else if(session.attributes.isAddingField) {
        this.response.speak(this.t('check_add_field_misunderstood_number')).listen();
        this.emit(':responseReady');
        return false;
    }

    return true;
}

function checkRemoveNumbersIntent(session, response) {
    if(session.attributes.isRemovingNumbers) {
        this.response.speak(this.t('check_remove_numbers_yes_no'));
        this.emit(':responseReady');
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
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        appendSuper6Win(session, response, speechOutput);

                    }).catch(function(err) {
                        this.response.speak(this.t('last_drawing_request_failed'));
                        this.emit(':responseReady');
                    });
                } else {
                    this.response.speak(this.t('last_drawing_request_failed'));
                    this.emit(':responseReady');
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
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";
                        this.response.speak(speechOutput);
                        this.emit(':responseReady');
                    }).catch(function(err) {
                        this.response.speak(this.t('last_drawing_request_failed'));
                        this.emit(':responseReady');
                    });
                } else {
                    this.response.speak(this.t('last_drawing_request_failed'));
                    this.emit(':responseReady');
                }
            });
        } else {
            speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";
            this.response.speak(speechOutput);
            this.emit(':responseReady');
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
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(session.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";
                        this.response.speak(speechOutput);
                        this.emit(':responseReady');
                    }).catch(function(err) {
                        this.response.speak(this.t('last_drawing_request_failed'));
                        this.emit(':responseReady');
                    });
                } else {
                    this.response.speak(this.t('last_drawing_request_failed'));
                    this.emit(':responseReady');
                }
            });
        } else {
            speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee') + "</speak>";
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }
    });
}

function resolveSlotValue(slots, slotName) {
    var whatAlexaUnderstood; 
    if(slots[slotName] && slots[slotName].value)
    {
        if(slots[slotName].resolutions && slots[slotName].resolutions.resolutionsPerAuthority && slots[slotName].resolutions.resolutionsPerAuthority[0].status.code == "ER_SUCCESS_MATCH")
            whatAlexaUnderstood += slots[slotName].resolutions.resolutionsPerAuthority[0].values[0].value.name;
        else
            whatAlexaUnderstood = slots[slotName].value;
    }

    return whatAlexaUnderstood;
}