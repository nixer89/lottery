
//Simple property file to get the correct language

exports.getGermanProperties = function() {
    return properties.de_DE;
}

exports.getEnglishProperties = function() {
    return properties.en_US;
}


var properties =
{
    de_DE: {
        //general
        you_are_wrong_here: "Entschuldige, ich habe dich nicht verstanden. Sage: Hilfe, um dir Kommandos an die Alexa App schicken zu lassen.",
        unknown_lottery: "Tut mir leid, diese Lotterie kenne ich nicht. Frage mich, welche Lotterien unterstützt werden, um eine Übersicht in der Alexa App zu erhalten",
        ok: "Okay.",
        ok_your: "Ok, deine ",
        without_guarantee: "Alle Angaben wie immer ohne Gewähr.",
        is_connector: " ist ",

        //welcome prompt
        welcome: "Willkommen bei Mein Lotto, jetzt auch mit Spiel77 und Super6! Sage 'Feld hinzufügen und den Lotterie-Namen' um deine Lottozahlen zu speichern oder sage 'Hilfe' um dir weitere Kommandos in der Alexa App anzusehen.",
        welcome_reprompt: "Sage 'Hilfe' um Kommandos in der Alexa App zu sehen!",

        //hello intent
        hello: "Hallo. Es werden jetzt auch Spiel77, Super6 und weitere Lotterien unterstüzt. Für mehr Informationen sage einfach: Hilfe!",
        hello_reprompt: "Hallo!",

        //new number intent
        unknown_number: "Die Zahl liegt nicht innerhalb meines Wertebereichs oder wurde nicht richtig erkannt. Bitte wiederhole ",
        add_numbers: "Wenn du deine Zahlen hinzufügen willst, musst du 'Feld hinzufügen und den Lotterie-Namen' sagen.",
        not_recognized_number: "Tut mir leid, ich konnte die Zahl nicht verstehen. Bitte sage sie noch einmal.",

        //change Lottery Number intent
        corrected_number: "Ok, ich habe deine letzte Zahl verworfen. Bitte wiederhole ",
        add_number_before_changing: "Du musst erst Zahlen hinzufügen, bevor du korrigieren kannst. Wie lautet deine erste Zahl?",

        //add lottery numbers intent
        speech_first_part: "Ein neues Feld wird für ",
        speech_second_part: " angelegt. Sage korrigieren, um deine vorherige Zahl zu ändern.",
        speech_third_part_normal: " Wie lautet deine erste Zahl?",
        speech_third_part_additional_lottery: " Bitte sage jede einzelne Zahl der kompletten Tippscheinnummer nacheinander, beginnend von links, an. Wie lautet die erste Zahl von links?",
        add_lottery_number_reprompt: "Wie lautet deine erste Zahl?",

        //remove lottery number intent
        remove_first_part: "Alle deine Zahlen für ",
        remove_second_part: " werden gelöscht und müssen neu angelegt werden. Bist du sicher?",
        remove_success: " wurden erfolgreich gelöscht.",
        remove_error: "Beim Löschen deiner Zahlen ist ein Fehler aufgetreten.",

        //No intent
        ticket_number_saved: "Ok, deine Tippscheinnummer wurde nicht gespeichert!",
        numbers_not_saved: " Zahlen werden nicht gespeichert!",
        numbers_not_deleted: "  Zahlen werden nicht gelöscht!!",

        //lottery win intent
        amount_you_won: "Dein Gewinn beträgt ",
        amount_currency: " Euro.",
        no_amount_set_yet: "Die Gewinnsumme steht noch nicht fest.",
        last_drawing_request_failed: "Bei der Abfrage der letzten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.",
        add_numbers_before_asking_for_win_1: "Du musst erst Zahlen für ",
        add_numbers_before_asking_for_win_2: " hinterlegen, damit ich prüfen kann, ob du gewonnen hast. Sage dazu einfach 'Feld hinzufügen ",

        //MyCurrentNumbers intent
        current_numbers_1: "Hier sind deine aktuell gespeicherten ",
        current_numbers_2: " Zahlen. ",
        current_numbers_lottery_ticket_number: " Tippscheinnummer ",
        current_numbers_field: "Feld ",
        current_numbers_no_numbers_1: "Du hast noch keine Zahlen für ",
        current_numbers_no_numbers_2: " hinterlegt. Sage: Feld hinzufügen ",
        current_numbers_no_numbers_3: ", um deine Zahlen anzulegen.",

        //AskForLatestLotteryNumbers
        latest_lottery_drawing_numbers: "Hier sind die Gewinnzahlen der letzten Ziehung ",
        latest_lottery_numbers_from: " von ",
        
        //AskForLotteryJackpot
        current_jackpot_size_1: "Der aktuelle Jackpott von ",
        current_jackpot_size_2: " beträgt ",
        current_jackpot_size_3: " Millionen Euro.",
        current_jackpot_size_error: "Bei der Abfrage nach dem aktuellen Jackpott ist ein Fehler aufgetreten. Bitte entschuldige.",

        //AskForNextLotteryDrawing intent
        next_drawing_1: "Die nächste Ziehung von ",
        next_drawing_2: " ist am ",
        next_drawing_failed: "Bei der Abfrage nach der nächsten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.",

        //SupportedLotteries intent
        supportet_lotteries: "Aktuell werden die Lotteriesysteme 6aus49, Eurojackpot, EuroMillions, PowerBall, MegaMillions und die Zusatzlotterien Spiel77 und Super6 unterstützt. Sage: Feld hinzufügen und den Lotterienamen, um deine Zahlen zu speichern oder sage: Beenden, um den Skill zu schließen.",

        //NullNumberIntent intent
        null_number_intent_error_1: "Wenn du deine Zahlen hinzufügen willst, musst du 'Feld hinzufügen und den Lotterie-Namen' sagen.",
        null_number_intent_error_2: "Tut mir leid, ich konnte die Zahl nicht verstehen. Bitte sage sie noch einmal.",

        //EndIntent & AMAZON.StopIntent & AMAZON.CancelIntent
        goodbye_intent: "Tschüss und weiterhin viel Glück!", 

        //ThanksIntent
        thanks_intent: "Bitte",

        //AMAZON.HelpIntent
        help_intent_help_line: "Mit diesem Skill kannst du deine Lottozahlen hinterlegen und abfragen, ob du gewonnen hast. Deine Zahlen werden dann gegen die letzte Ziehung der angegebenen Lotterie verglichen. Ich habe ein paar Beispiel-Kommandos an die Alexa App gesendet. Öffne die App und schaue dir die Kommandos an. Um zu erfahren, welche Lotteriesysteme unterstüzt werden, frage einfach: Welche Lotterien werden unterstützt?",
        help_intent_repromt_line: "Sage: Feld hinzufügen und den Lotterienamen, um deine Lottozahlen zu hinterlegen.",
        help_intent_card_title_line: "MeinLotto Kommandos",
        help_intent_card_content_line: "Hier sind ein paar nützliche Kommandos:\n- füge ein Feld für 6aus49 hinzu\n- habe ich in Euro Jackpot gewonnen?" +
        "\n- was sind meine aktuell hinterlegten Zahlen für 6aus49\n- was sind die aktuellen Gewinnzahlen von PowerBall\n- lösche meine Zahlen von Euro Jackpot" +
        "\n- wann ist die nächste Ziehung EuroMillions?\n- wie hoch ist der Jackpott von 6aus49",

        //saveNewLottoNumbers function
        save_new_numbers_ask_super6: " Spielst du damit auch Super sechs?",
        save_new_numbers_ask_spiel77: " Spielst du damit auch Spiel77?",
        save_new_numbers_failed: "Deine Zahlen konnten nicht gespeichert werden. Es kam zu einem Fehler.",

        //getSaveSpeechOutput function
        speech_output_saved_lottery_ticket_number: " Deine Tippscheinnummer wurde erfolgreich für ",
        speech_output_saved_lottery_numbers: " Deine Zahlen wurden erfolgreich für ",
        speech_output_successfully_saved: " gespeichert. ",

        //doLotteryNumberCheck function
        just_whole_numbers_allowed: "Es sind nur ganze Zahlen erlaubt. Bitte wähle eine neue Zahl.",
        range_check_numbers_repromt: "Bitte wähle eine neue Zahl.",

        range_check_main_numbers_1: "Die Zahl darf nicht kleiner als ",
        range_check_main_numbers_2: " und nicht größer als ",
        range_check_main_numbers_3: " sein. Bitte wähle eine neue Zahl.",

        range_check_additional_number_1: " Die ",
        range_check_additional_number_2: " darf nicht kleiner als ",
        range_check_additional_number_3: " und nicht größer als ",
        range_check_additional_number_4: " sein. Bitte wähle eine neue Zahl.",

        check_duplicate_number: "Du hast diese Zahl schon angegeben. Doppelte Zahlen sind nicht erlaubt. Bitte wähle eine neue Zahl.",

        //checkWhatNumberIsNext function
        check_next_number_current_numbers: "Danke. Deine Zahlen lauten. ",
        check_next_number_ask_correct: ". Ist das korrekt?",
        check_next_number_ask_correct_all_numbers: "Sind die Zahlen korrekt?",

        check_next_number_ask_next_number_start_1: "Wie lautet ",
        check_next_number_is_zero: "null",
        check_next_number_ask_for_number: " Zahl?",
        check_next_number_ask_next_number_start_2: "Wie lautet deine ",
        check_next_number_your: "deine ",

        //checkAddFieldIntent function
        check_add_field_misunderstood_yes_no: "Tut mir leid, ich habe dich nicht richtig verstanden. Sage 'JA', um die Zahlen zu speichern, oder 'NEIN', um die Zahlen zu verwerfen.",
        check_add_field_misunderstood_number: "Tut mir leid, ich habe die Zahl nicht richtig verstanden. Bitte wiederhole die Zahl oder sage abbrechen",

        //checkRemoveNumbersIntent function
        check_remove_numbers_yes_no: "Tut mir leid, ich habe dich nicht richtig verstanden. Sage 'JA', um die Zahlen zu löschen, oder 'NEIN', um die Zahlen nicht zu löschen."
    },

    en_US: {
        //general
        you_are_wrong_here: "Sorry, I don`t know what you mean. Say: help, to view more commands in the alexa app.",
        unknown_lottery: "Sorry, but I don`t know this lottery. Ask: 'which lotteries are supported', to send them to the alexa app!",
        ok: "Okay.",
        ok_your: "Okay, your ",
        without_guarantee: "All statements without guarantee.",
        is_connector: " is ",

        //welcome prompt
        welcome: "Welcome to my lottery! Say: 'add field', and the lottery name, to save your lottery numbers. Say: help, to view more commands in the alexa app.",
        welcome_reprompt: "Say: help, to view more commands in the alexa app!",

        //hello intent
        hello: "Hello. Just say: help, for more information!",
        hello_reprompt: "Hello!",
        
        //new number intent
        unknown_number: "The number is not within my known range or was not detected properly. Please repeat ",
        add_numbers: "Please say: Add field, and the lottery name, to add your lottery numbers",
        not_recognized_number: "Sorry, but I couldn`t understand your number properly. Please repeat!",

        //new number intent
        corrected_number: "Ok, I have discarded your last number. Please repeat ",
        add_number_before_changing: "To change your number, you need to add them first! What is your first number?",

        //change Lottery Number intent
        speech_first_part: "A new field for ",
        speech_second_part: " will be added. Say: change, to modify your last number!",
        speech_third_part_normal: " What is your first number?",
        speech_third_part_additional_lottery: " Please say every single number of your lottery ticket number step by step, starting from the left. What`s your first number?",
        add_lottery_number_reprompt: "What is your first number?",

        //remove lottery number intent
        remove_first_part: "All your numbers of ",
        remove_second_part: " will be deleted and need to be reconfigured. Are you sure?",
        remove_success: " were removed successfully!",
        remove_error: "Some error occued while deleting your numbers!",

        //No intent
        ticket_number_saved: "Okay, I didn`t save your lottery ticket number!",
        numbers_not_saved: " numbers won`t be saved.",
        numbers_not_deleted: " numbers won`t be deleted.",

        //lottery win intent
        amount_you_won: "The amount you won is: ",
        amount_currency: " Euro.",
        no_amount_set_yet: "The amount you won is not available yet!",
        last_drawing_request_failed: "I´m sorry but the request of the latest drawn numbers failed.",
        add_numbers_before_asking_for_win_1: "To check if you won in the last drawing, you need to add your ",
        add_numbers_before_asking_for_win_2: " numbers first. Just say: 'Add field ",

        //MyCurrentNumbers intent
        current_numbers_1 : "Your currently saved ",
        current_numbers_2 : " numbers are. ",
        current_numbers_lottery_ticket_number : "lottery ticket number ",
        current_numbers_field : "Feld ",
        current_numbers_no_numbers_1 : "You haven't saved any numbers for ",
        current_numbers_no_numbers_2 : " yet. Say: Add field ",
        current_numbers_no_numbers_3 : " to store new numbers.",

        //AskForLatestLotteryNumbers intent
        latest_lottery_drawing_numbers: "These are the latest drawn numbers of ",
        latest_lottery_numbers_from: " from ",

        //AskForLotteryJackpot intent
        current_jackpot_size_1: "The current jackpot of ",
        current_jackpot_size_2: " is ",
        current_jackpot_size_3: " million euro.",
        current_jackpot_size_error: "I´m sorry, but the request for the current jackpot size failed.",

        //AskForNextLotteryDrawing intent
        next_drawing_1: "The next drawing for ",
        next_drawing_2: " is on ",
        next_drawing_failed: "I´m sorry, but the request for the next drawing failed.",

        //SupportedLotteries intent
        supportet_lotteries: "Currently, following lotteries are supported: german 6 out of 49, euro jackpot, euro millions, powerBall, mega millions and german additional lottiers 'Spiel77' and 'super 6'. Say: add field and the lottery name to save your numbers or say: cancel, to close the skill",

        //NullNumberIntent intent
        null_number_intent_error_1: "If you want to add you numbers, you need to say: add field, and the lottery name.",
        null_number_intent_error_2: "I´m sorry but I could not recongnize the number you said. Please repeat your number",

        //EndIntent & AMAZON.StopIntent & AMAZON.CancelIntent
        goodbye_intent: "Bye and good luck for the next time!",

        //ThanksIntent
        thanks_intent: "You`re welcome",

        //AMAZON.HelpIntent
        help_intent_help_line: "With this skill, you are able to store you lottery numbers and ask if you did win in the last drawing. You`re stored numbers will be matched to the numbers of the last drawing of the given lottery. I´ve just send you some example commands to your alexa app. Open the app and check the commands. To check the supported lotteries, just say: Which lotteries are supported?",
        help_intent_repromt_line: "Say: 'add field', and the lottery name, to store your lottery numbers",
        help_intent_card_title_line: "my lottery commands",
        help_intent_card_content_line: "Here you find some usefull commands:\n- add field for PowerBall\n- did I win in mega millions?" +
        "\n- what are my currently stored numbers for PowerBall?\n- what are the last drawn numbers of PowerBall?\n- delete my numbers of Euro Jackpot" +
        "\n- when is the next drawing for Euro Millions?\n- what is the current jackpot of PowerBall?",

        //saveNewLottoNumbers function
        save_new_numbers_ask_super6: " Are you also playing super 6?",
        save_new_numbers_ask_spiel77: " Are you also playing spiel 77?",
        save_new_numbers_failed: "I´m sorry, but I could not save your numbers. An error occured.",

        //getSaveSpeechOutput function
        speech_output_saved_lottery_ticket_number: " Your lottery ticket number has been successfully saved for ",
        speech_output_saved_lottery_numbers: " Your lottery numbers have been successfully saved for ",
        speech_output_successfully_saved: " ",

        //doLotteryNumberCheck function
        just_whole_numbers_allowed: "Only whole numbers are allowed. Please choose a new number.",
        range_check_numbers_repromt: "Please choose a new number.",

        range_check_main_numbers_1: "The number cannot be smaller than ",
        range_check_main_numbers_2: " and not bigger than ",
        range_check_main_numbers_3: " . Please choose a new number.",

        range_check_additional_number_1: " The ",
        range_check_additional_number_2: " cannot be smaller than ",
        range_check_additional_number_3: " and not bigger than ",
        range_check_additional_number_4: " . Please choose a new number.",

        check_duplicate_number: "You have already added this number. Duplicate numbers are not allowed. Please choose a new number.",

        //checkWhatNumberIsNext
        check_next_number_current_numbers: "Thank you! Your numbers are: " ,
        check_next_number_ask_correct: ". Is this correct?",
        check_next_number_ask_correct_all_numbers: "Are your numbers correct?",

        check_next_number_ask_next_number_start_1: "what is ",
        check_next_number_is_zero: "zero",
        check_next_number_ask_for_number: ". number?",
        check_next_number_ask_next_number_start_2: "What is your ",
        check_next_number_your: "your ",

        //checkAddFieldIntent function
        check_add_field_misunderstood_yes_no: "I´m sorry, I could not recognize what you said. Say 'YES' to save your numbers or 'NO' to discard your numbers.",
        check_add_field_misunderstood_number: "I´m sorry, I did not understand your number correctly. Please repeat your number or say 'cancel'.",

        //checkRemoveNumbersIntent function
        check_remove_numbers_yes_no: "I´m sorry, I could not recognize what you said. Say 'YES' to delete your numbers or 'NO' to keep your numbers'"
    }
}