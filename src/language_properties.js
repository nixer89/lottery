
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
        no_amount_set_yet: "Die Gewinnsumme steht noch nicht fest.",
        last_drawing_request_failed: "Bei der Abfrage der letzten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.",
        add_numbers_before_asking_for_win_1: "Du musst erst Zahlen für ",
        add_numbers_before_asking_for_win_2: " hinterlegen, damit ich prüfen kann, ob du gewonnen hast. Sage dazu einfach 'Feld hinzufügen ",

        //MyCurrentNumbers intent
        current_numbers_1 : "Hier sind deine aktuell gespeicherten ",
        current_numbers_2 : " Zahlen: ",
        current_numbers_lottery_ticket_number : " Tippscheinnummer ",
        current_numbers_field : "Feld ",
        current_numbers_no_numbers_1 : "Du hast noch keine Zahlen für ",
        current_numbers_no_numbers_2 : " hinterlegt. Sage: Feld hinzufügen ",
        current_numbers_no_numbers_3 : ", um deine Zahlen anzulegen.",

    },

    en_US: {
        //general
        you_are_wrong_here: "Sorry, I don`t know what you mean. Say: help, to view more commands in the alexa app.",
        unknown_lottery: "Sorry, but I don`t know this lottery. Ask which lotteries are supported to send them to the alexa app!",
        ok: "Okay.",
        ok_your: "Okay, your ",
        without_guarantee: "Alle Angaben wie immer ohne Gewähr.",

        //welcome prompt
        welcome: "Welcome to my lottery! Say: 'add field, and the lottery name', to save your lottery numbers. Say: help, to view more commands in the alexa app.",
        welcome_reprompt: "Say: help, to view more commands in the alexa app!",

        //hello intent
        hello: "Hello. Just say: help, for more information!",
        hello_reprompt: "Hello!",
        
        //new number intent
        unknown_number: "The number is not within my known range or was not detected properly. Please repeat ",
        add_numbers: "You need to say: Add field, and the lottery name, to add your lottery numbers",
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
        no_amount_set_yet: "The amount you won is not set yet!",
        last_drawing_request_failed: "Bei der Abfrage der letzten Ziehung ist ein Fehler aufgetreten. Bitte entschuldige.",
        add_numbers_before_asking_for_win_1: "Du musst erst Zahlen für ",
        add_numbers_before_asking_for_win_2: " hinterlegen, damit ich prüfen kann, ob du gewonnen hast. Sage dazu einfach 'Feld hinzufügen ",

        //MyCurrentNumbers intent
        current_numbers_1 : "Your currently saved ",
        current_numbers_2 : " numbers are: ",
        current_numbers_lottery_ticket_number : "lottery ticket number ",
        current_numbers_field : "Feld ",
        current_numbers_no_numbers_1 : "You haven't saved any numbers for ",
        current_numbers_no_numbers_2 : " yet. Say: Add field ",
        current_numbers_no_numbers_3 : ", to store new numbers.",
    }
}