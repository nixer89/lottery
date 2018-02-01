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
    "HelloIntent": function () {
        if(!checkIntentStatus()) return;

        this.response.speak(this.t('hello')).listen(this.t('hello_reprompt'));
        this.emit(':responseReady');
    },
    "NewNumber": function () {
        if(!checkRemoveNumbersIntent()) return;

        var lotteryNumber = resolveSlotValue(this.event.request.intent.slots, 'lotteryNumber');

        if(this.attributes.isAddingField && lotteryNumber == "?") {
            checkWhatNumberIsNext(null, this.t('unknown_number'));
        } else if(this.attributes.isAddingField && this.attributes.currentConfig && this.attributes.currentConfig.isZusatzLottery && lotteryNumber) {
            doZusatzLotteryNumberCheck(lotteryNumber);
        } else if(this.attributes.isAddingField && lotteryNumber && this.attributes.currentConfig && !this.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(lotteryNumber);
        } else if(lotteryNumber && !this.attributes.isAddingField) {
            this.response.speak(this.t('add_numbers')).listen();
            this.emit(':responseReady');
        }else {
            this.response.speak(this.t('not_recognized_number')).listen();
            this.emit(':responseReady');
        }
    },
    "ChangeLotteryNumberIntent": function () {
        if(!checkRemoveNumbersIntent()) return;

        if(this.attributes.isAddingField && this.attributes.newNumbersMain && this.attributes.newNumbersMain.length > 0) {
            if(this.attributes.newNumbersAdditional.length == 0)
                this.attributes.newNumbersMain.pop();
            else
                this.attributes.newNumbersAdditional.pop();

            checkWhatNumberIsNext(null, this.t('corrected_number'));
        } else if(this.attributes.isAddingField && (!this.attributes.newNumbers || this.attributes.newNumbers.length == 0)) {
            this.response.speak(this.t('add_number_before_changing')).listen();
            this.emit(':responseReady');
        } else if(!this.attributes.isAddingField) {
            this.response.speak(this.t('add_numbers')).listen();
            this.emit(':responseReady');
        } else {
            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
        }
    },
    "AddLotteryNumbers": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            setUpForNewField(lotteryName);
            var speechStart = this.t('speech_first_part') + this.attributes.currentConfig.speechLotteryName + this.t('speech_second_part');
            if(this.attributes.currentConfig.isZusatzLottery) {
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
    "RemoveLotteryNumbers": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            this.attributes.currentConfig = skillHelper.getConfigByUtterance(lotteryName);
            this.attributes.isRemovingNumbers = true;
            this.response.speak(this.t('remove_first_part') + this.attributes.currentConfig.speechLotteryName + this.t('remove_second_part')).listen();
            this.emit(':responseReady');
        } else {
            this.response.speak(this.t('unknown_lottery')).listen();
            this.emit(':responseReady');
        }
    },
    "AMAZON.YesIntent": function () {

        if(this.attributes.addToSuper6 && this.attributes.isAddingField && lotteryFieldHasMaxLength()) {
            //also add spiel77 number to super6
            this.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSuper6LotteryName());
            this.attributes.addToSpiel77 = true;
            saveNewLottoNumbers();
        } else if(this.attributes.addToSpiel77 && this.attributes.isAddingField && lotteryFieldHasMaxLength()) {
            //also add super6 to spiel77
            this.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSpiel77LotteryName());
            this.attributes.addToSuper6 = true;
            saveNewLottoNumbers();
        } else if(this.attributes.isAddingField && lotteryFieldHasMaxLength()) {
            //add new field
            saveNewLottoNumbers();
        } else if (this.attributes.isRemovingNumbers && this.attributes.currentConfig) {
            //remove all numbers
            skillHelper.getLotteryDbHelper(this.attributes.currentConfig.lotteryName).removeLotteryNumbers(this.event.context.System.user.userId).then(function(result) {
                if(result) {
                    this.response.speak(this.t('remove_first_part') + this.attributes.currentConfig.speechLotteryName + this.t('remove_success'));
                    this.emit(':responseReady');
                }
            }).catch(function(error) {
                this.response.speak(this.t('remove_error'));
                this.emit(':responseReady');
            });
        } else {
            if(!checkAddFieldIntent()) return;
            
            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
        }
    },
    "AMAZON.NoIntent": function () {
        if(this.attributes.addToSuper6 || this.attributes.addToSpiel77) {
            this.response.speak('ok');
            this.emit(':responseReady');
        } else if(this.attributes.isAddingField && this.attributes.isZusatzLottery && lotteryFieldHasMaxLength()) {
            this.response.speak(this.t('ticket_number_saved'));
            this.emit(':responseReady');
        } else if(this.attributes.isAddingField && lotteryFieldHasMaxLength()) {
            this.response.speak(this.t('ok_your') + this.attributes.currentConfig.speechLotteryName + this.t('numbers_not_saved'));
            this.emit(':responseReady');
        } else if(this.attributes.isRemovingNumbers) {
            this.response.speak(this.t('ok_your') + this.attributes.currentConfig.speechLotteryName + this.t('numbers_not_deleted'));
            this.emit(':responseReady');
        } else {
            if(!checkAddFieldIntent()) return;

            this.response.speak(this.t('you_are_wrong_here')).listen();
            this.emit(':responseReady');
        }
    },
    "AskForLotteryWinIntent": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            
            var config = skillHelper.getConfigByUtterance(lotteryName);
            this.attributes.currentConfig = config;

            readLotteryNumbers().then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                        if(lotteryNumbersAndDate) {
                            //check how many matches we have with the given numbers!
                            var rank = skillHelper.getRank(this.attributes, lotteryNumbersAndDate, myNumbers);

                            skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                                var moneySpeech;
                                if(money && money.length > 0)
                                    moneySpeech = this.t('amount_you_won') + money;
                                else
                                    moneySpeech = this.t('no_amount_set_yet');
                                    
                                    var speechOutput = skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutput(rank, moneySpeech, lotteryNumbersAndDate[2]);

                                if(this.attributes.currentConfig.lotteryName == skillHelper.getGermanLotteryName()) {
                                    checkForSpiel77(speechOutput);
                                } else if(this.attributes.currentConfig.lotteryName == skillHelper.getAustrianLotteryName()) {
                                    checkForJoker(speechOutput);
                                } else {
                                    speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee');
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
    //"AskForLotteryWinOverAll": function () {
    //    checkIntentStatus();
    //    skillHelper.generateOverAllWinOutput();
    //},
    "MyCurrentNumbers": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            var config = skillHelper.getConfigByUtterance(lotteryName);
            this.attributes.currentConfig = config;

            readLotteryNumbers().then(function(myNumbers) {
                if(myNumbers && myNumbers.length > 0) {
                    var speakOutput = this.t('current_numbers_1') + config.speechLotteryName + this.t('current_numbers_2') + "<break time=\"200ms\"/>";

                    for(var i = 0; i < myNumbers.length; i++) {
                        speakOutput += (myNumbers.length > 1 ? (this.attributes.currentConfig.isZusatzLottery ? this.t('current_numbers_lottery_ticket_number') : this.t('current_numbers_field')) + (i+1) : "") + ": <break time=\"500ms\"/>";
                        speakOutput += skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(myNumbers[i]);
                        speakOutput += ". ";
                    }

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
    "AskForLatestLotteryNumbers": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            var config = skillHelper.getConfigByUtterance(lotteryName);
            
            skillHelper.getLotteryApiHelper(config.lotteryName).getLastLotteryDateAndNumbers().then(function(numbers) {
                if(numbers) {
                    var speakOutput = this.t('latest_lottery_drawing_numbers') + config.speechLotteryName + this.t('latest_lottery_numbers_from') + numbers[2] + ". <break time=\"500ms\"/>";
                    speakOutput += skillHelper.getLotteryApiHelper(config.lotteryName).createSSMLOutputForNumbers(numbers);
                    speakOutput += ". <break time=\"200ms\"/>" + this.t('without_guarantee');

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
     "AskForLotteryJackpot": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            var config = skillHelper.getConfigByUtterance(lotteryName);
            
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
     "AskForNextLotteryDrawing": function () {
        if(!checkIntentStatus()) return;

        var lotteryName = resolveSlotValue(this.event.request.intent.slots, 'lotteryName');

        if(lotteryName && skillHelper.isLotteryNameSupported(lotteryName)) {
            var config = skillHelper.getConfigByUtterance(lotteryName);
            
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
     "SupportedLotteries": function () {
         if(!checkIntentStatus()) return;

         this.response.speak(this.t('supportet_lotteries')).listen();
         this.emit(':responseReady');
     },
     "NullNumberIntent": function () {
        if(!checkRemoveNumbersIntent()) return;

        if(this.attributes.isAddingField && this.attributes.currentConfig && this.attributes.currentConfig.isZusatzLottery) {
            doZusatzLotteryNumberCheck(0);
        } else if(this.attributes.isAddingField && this.attributes.currentConfig && !this.attributes.currentConfig.isZusatzLottery) {
            doLotteryNumberCheck(0);
        } else if(!this.attributes.isAddingField) {
            this.response.speak(this.t('null_number_intent_error_1')).listen();
            this.emit(':responseReady');
        }else {
            this.response.speak(this.t('null_number_intent_error_2')).listen();
            this.emit(':responseReady');
        }
     },
     "EndIntent": function () {
         this.response.speak(this.t('goodbye_intent'));
         this.emit(':responseReady');
     },
     "ThanksIntent": function () {
         if(!checkIntentStatus()) return;

         this.response.speak(this.t('thanks_intent'));
         this.emit(':responseReady');
     },
    "AMAZON.HelpIntent": function () {
        if(!checkIntentStatus()) return;

        var help = this.t('help_intent_help_line');
        var repromt = this.t('help_intent_repromt_line');
        var cardTitle = this.t('help_intent_card_title_line');
        var cardContent = this.t('help_intent_card_content_line');
        
        this.response.speak(help).listen(repromt).cardRenderer(cardTitle, cardContent, null);
        this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function () {
        this.response.speak(this.t('goodbye_intent'));
        this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak(this.t('goodbye_intent'));
        this.emit(':responseReady');
    },
    "TestIntent": function () {
        var germanNumbers = [[["10","20","13","40","15","26"],["7", "1"]],[["49","21","13","31","15","1"],["2","8"]]];
        var tippscheinNummer = ["10","9","8"];

        setUpForNewField(skillHelper.getGermanZusatzLotteryName());
        this.attributes.newNumbersMain = ["9","8","7","6","5","4","3"];

        console.log("try to save numbers:" + this.attributes.newNumbersMain);
        //saveNewLottoNumbers();
        readLotteryNumbers().then(function(myNumbers) {
            console.log("Read:" + myNumbers);
        });
    }
};

function setUpForNewField(lotteryName) {
    this.attributes.isAddingField = true;
    this.attributes.newNumbersMain = [];
    this.attributes.newNumbersAdditional = [];
    this.attributes.currentConfig = skillHelper.getConfigByUtterance(lotteryName);
}

function saveNewLottoNumbers() {
    if(lotteryFieldHasMaxLength()) {
        readLotteryNumbers().then(function(oldNumbers) {
            //convert numbers from int to string
            var newNumbers = [];
            newNumbers[0] = this.attributes.newNumbersMain;
            newNumbers[1] = this.attributes.newNumbersAdditional;

            var convertedNumbers = skillHelper.convertNewNumbersForStoring(newNumbers);
            //set new numbers at the end of all numbers
            oldNumbers[oldNumbers.length] = convertedNumbers;

            skillHelper.getLotteryDbHelper(this.attributes.currentConfig.lotteryName).updateLotteryNumbers(this.event.context.System.user.userId , oldNumbers).then(function(result) {
                if(result) {
                    if(this.attributes.currentConfig.lotteryName == skillHelper.getSpiel77LotteryName() && !this.attributes.addToSuper6) {
                        this.attributes.addToSuper6 = true;
                        this.response.speak(getSaveSpeechOutput() + this.t('save_new_numbers_ask_super6'));
                        this.emit(':responseReady');
                    } else if(this.attributes.currentConfig.lotteryName == skillHelper.getSuper6LotteryName() && !this.attributes.addToSpiel77) {
                        this.attributes.addToSpiel77 = true;
                        this.response.speak(getSaveSpeechOutput() + this.t('save_new_numbers_ask_spiel77'));
                        this.emit(':responseReady');
                    } else {
                        if(this.attributes.currentConfig.isZusatzLottery) {
                            this.response.speak(getSaveSpeechOutput());
                            this.emit(':responseReady');
                        } else {
                            this.response.speak(getSaveSpeechOutput());
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

function getSaveSpeechOutput() {
    if(this.attributes.currentConfig.isZusatzLottery)
        return this.t('speech_output_saved_lottery_ticket_number') + this.attributes.currentConfig.speechLotteryName + this.t('speech_output_successfully_saved');
    else
        return this.t('speech_output_saved_lottery_numbers') + this.attributes.currentConfig.speechLotteryName + this.t('speech_output_successfully_saved');
}

function readLotteryNumbers() {
    return skillHelper.getLotteryDbHelper(this.attributes.currentConfig.lotteryName).readLotteryNumbers(this.event.context.System.user.userId).then(function(result) {
            if(result) {
                if(result.length > 0) {
                    if(this.attributes.currentConfig.isZusatzLottery)
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

function doLotteryNumberCheck(newNumber) {
    if(newNumber%1 != 0)
        this.response.speak(this.t('just_whole_numbers_allowed')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);

    //noch keine additional numbers -> checke auf range der main numbers
    if(this.attributes.newNumbersMain.length < this.attributes.currentConfig.numberCountMain && (newNumber < this.attributes.currentConfig.minRangeMain || newNumber > this.attributes.currentConfig.maxRangeMain)) {
        this.response.speak(this.t('range_check_main_numbers_1') + this.attributes.currentConfig.minRangeMain + this.t('range_check_main_numbers_2') + this.attributes.currentConfig.maxRangeMain + this.t('range_check_main_numbers_3')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    //alle main numbers angegeben, checke auf range der additional numbers
    } else if(this.attributes.newNumbersMain.length == this.attributes.currentConfig.numberCountMain && (newNumber < this.attributes.currentConfig.minRangeAdditional || newNumber > this.attributes.currentConfig.maxRangeAdditional)) {
        this.response.speak(skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getCorrectArticle() + this.attributes.currentConfig.additionalNumberName + this.t('range_check_additional_number_2') + this.attributes.currentConfig.minRangeAdditional + this.t('range_check_additional_number_3') + this.attributes.currentConfig.maxRangeAdditional + this.t('range_check_additional_number_4')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    //prüfe ob eine main number oder eine additional number schon doppelt sind!
    } else if((this.attributes.newNumbersMain.length <= this.attributes.currentConfig.numberCountMain -1 && this.attributes.newNumbersMain.indexOf(newNumber) != -1) ||
                (this.attributes.newNumbersAdditional.length <= this.attributes.currentConfig.numberCountAdditional-1 && this.attributes.newNumbersAdditional.indexOf(newNumber) != -1)) {
            this.response.speak(this.t('check_duplicate_number')).listen(this.t('range_check_numbers_repromt'));
            this.emit(':responseReady');
    } else {
        //zahl is valide, also füge sie hinzu!
        if(this.attributes.newNumbersMain.length < this.attributes.currentConfig.numberCountMain)
            this.attributes.newNumbersMain.push(newNumber);
        else
            this.attributes.newNumbersAdditional.push(newNumber);

    checkWhatNumberIsNext(newNumber, "");
    
    }
}

function checkWhatNumberIsNext(newNumber, additionalSpeechInfo) {
    //check ob weitere Zahlen hinzugefügt werden müssen
    if(lotteryFieldHasMaxLength()) {
        var numbers = [];
        numbers[0] = this.attributes.newNumbersMain.slice(0);
        numbers[1] = this.attributes.newNumbersAdditional.slice(0);
        //sort numbers for speech output!
        if(!this.attributes.currentConfig.isZusatzLottery)
            numbers[0] = numbers[0].sort((a, b) => a - b);

        numbers[1] = numbers[1].sort((a, b) => a - b);

        var speakOutput = this.t('check_next_number_current_numbers');

        speakOutput += skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createSSMLOutputForNumbers(numbers);
        speakOutput += this.t('check_next_number_ask_correct');
        this.response.speak(speakOutput).listen(this.t('check_next_number_ask_correct_all_numbers'));
        this.emit(':responseReady');

    } else if(this.attributes.newNumbersMain.length == this.attributes.currentConfig.numberCountMain) {

        var outPut = skillHelper.getCorrectPreWordAdditionalNumber(this.attributes.currentConfig.lotteryName) + 
                            (this.attributes.currentConfig.numberCountAdditional > 1 ? skillHelper.getCorrectNamingOfNumber((this.attributes.newNumbersAdditional.length + 1)) : "") + " " 
                            + this.attributes.currentConfig.additionalNumberName + "?";

        if(newNumber) {
            var speechOutputPost = this.t('check_next_number_ask_next_number_start_1') + outPut;
            var speechOutput = newNumber + "<break time=\"200ms\"/>" + speechOutputPost;

            this.response.speak(speechOutput).listen(speechOutputPost);
            this.emit(':responseReady');
        } else {
            this.response.speak(additionalSpeechInfo + outPut).listen();
            this.emit(':responseReady');
        }
    } else {
        if(newNumber || newNumber == 0) {
            var speechOutput = (newNumber == 0 ? this.t('check_next_number_is_zero') : newNumber)+ "<break time=\"200ms\"/>" + skillHelper.getCorrectNamingOfNumber((this.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number');
            this.response.speak(speechOutput).listen(this.t('check_next_number_ask_next_number_start_2') + skillHelper.getCorrectNamingOfNumber((this.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number'));
            this.emit(':responseReady');
        } else {
            this.response.speak(additionalSpeechInfo + this.t('check_next_number_your') + skillHelper.getCorrectNamingOfNumber((this.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number')).listen(this.t('check_next_number_ask_next_number_start_2') + skillHelper.getCorrectNamingOfNumber((this.attributes.newNumbersMain.length + 1)) + this.t('check_next_number_ask_for_number'));
            this.emit(':responseReady');
        }
    }
}

function doZusatzLotteryNumberCheck(newNumber) {
    if(newNumber%1 != 0)
        this.response.speak(this.t('just_whole_numbers_allowed')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');

    //round every 2.0 to 2!
    newNumber = Math.round(newNumber);
    
    //noch keine additional numbers -> checke auf range der main numbers
    if(this.attributes.newNumbersMain.length < this.attributes.currentConfig.numberCountMain && (newNumber < this.attributes.currentConfig.minRangeMain || newNumber > this.attributes.currentConfig.maxRangeMain)) {
        this.response.speak(this.t('range_check_main_numbers_1') + this.attributes.currentConfig.minRangeMain + this.t('range_check_main_numbers_2') + this.attributes.currentConfig.maxRangeMain + this.t('range_check_main_numbers_3')).listen(this.t('range_check_numbers_repromt'));
        this.emit(':responseReady');
    } else {
        //zahl is valide, also füge sie hinzu!
        if(this.attributes.newNumbersMain.length < this.attributes.currentConfig.numberCountMain)
            this.attributes.newNumbersMain.push(newNumber);

        checkWhatNumberIsNext(newNumber, "");
    }
}

function checkIntentStatus() {
    if(!checkAddFieldIntent())
        return false;
    
    return checkRemoveNumbersIntent();
}

function checkAddFieldIntent() {
    if(this.attributes.isAddingField && lotteryFieldHasMaxLength()) {
        this.response.speak(this.t('check_add_field_misunderstood_yes_no')).listen();
        this.emit(':responseReady');
        return false;
    } else if(this.attributes.isAddingField) {
        this.response.speak(this.t('check_add_field_misunderstood_number')).listen();
        this.emit(':responseReady');
        return false;
    }

    return true;
}

function checkRemoveNumbersIntent() {
    if(this.attributes.isRemovingNumbers) {
        this.response.speak(this.t('check_remove_numbers_yes_no'));
        this.emit(':responseReady');
        return false;
    }
    return true;
}

function lotteryFieldHasMaxLength() {
    if(this.attributes.newNumbersMain && this.attributes.newNumbersAdditional)
        return (this.attributes.newNumbersMain.length + this.attributes.newNumbersAdditional.length) == (this.attributes.currentConfig.numberCountMain + this.attributes.currentConfig.numberCountAdditional);
    else
        return false;
}

function checkForSpiel77(speechOutput) {
    this.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSpiel77LotteryName());

    readLotteryNumbers().then(function(mySpiel77Numbers) {
        if(mySpiel77Numbers && mySpiel77Numbers.length > 0) {
            skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(this.attributes, lotteryNumbersAndDate, mySpiel77Numbers);

                    skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        appendSuper6Win(speechOutput);

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
            appendSuper6Win(speechOutput);
        }
    });
}

function appendSuper6Win(speechOutput) {
    this.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getSuper6LotteryName());

    readLotteryNumbers().then(function(mySuper6Numbers) {
        if(mySuper6Numbers && mySuper6Numbers.length > 0) {
            skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(this.attributes, lotteryNumbersAndDate, mySuper6Numbers);

                    skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee');
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
            speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee');
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }
    });
}

function checkForJoker(speechOutput) {    
    this.attributes.currentConfig = skillHelper.getConfigByUtterance(skillHelper.getJokerLotteryName());

    readLotteryNumbers().then(function(myJokerNumbers) {
        if(myJokerNumbers && myJokerNumbers.length > 0) {
            skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastLotteryDateAndNumbers().then(function(lotteryNumbersAndDate) {
                if(lotteryNumbersAndDate) {
                    //check how many matches we have with the given numbers!
                    var rank = skillHelper.getRank(this.attributes, lotteryNumbersAndDate, myJokerNumbers);

                    skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).getLastPrizeByRank(rank).then(function(money) {
                        var moneySpeech = ""
                        if(money && money.length > 0)
                            moneySpeech = this.t('amount_you_won') + money;
                        else
                            moneySpeech = this.t('no_amount_set_yet');
                            
                        speechOutput += skillHelper.getLotteryApiHelper(this.attributes.currentConfig.lotteryName).createLotteryWinSpeechOutputShort(rank, moneySpeech, lotteryNumbersAndDate[2]);

                        speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee');
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
            speechOutput += "<break time=\"200ms\"/>" + this.t('without_guarantee');
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }
    });
}

function resolveSlotValue(slots, slotName) {
    var whatAlexaUnderstood; 
    if(slots.slotName && slotsslotName.value)
    {
        if(slots.slotName.resolutions && slots.slotName.resolutions.resolutionsPerAuthority && slots[slotName].resolutions.resolutionsPerAuthority[0].status.code == "ER_SUCCESS_MATCH")
            whatAlexaUnderstood += slots.slotName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        else
            whatAlexaUnderstood = slots.slotName.value;
    }

    return whatAlexaUnderstood;
}