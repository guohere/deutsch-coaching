import {
  LeitpunktStructureSuggestion,
  LeitpunktVocabSuggestion,
  SkillDrillExercise,
} from "./types";

export interface LeitpunktToolboxData {
  structures: LeitpunktStructureSuggestion[];
  vocab: LeitpunktVocabSuggestion[];
}

/**
 * Curated per-Leitpunkt COMPLETE, customizable B1/B2 German example sentences
 * (no incomplete "... [Verb am Ende]" blanks!) and topic keywords/collocations
 * for every verified Goethe Schreiben task, plus a smart dynamic generator.
 */
const CURATED_TASK_TOOLBOXES: Record<string, LeitpunktToolboxData[]> = {
  // 0. Die Vier-Tage-Woche (B2 Teil 1 — 4 Leitpunkte)
  "bank-schreiben-b2-work-06": [
    // Leitpunkt 1: Äußern Sie Ihre grundsätzliche Haltung zur Vier-Tage-Woche.
    {
      structures: [
        {
          patternDe:
            "Meines Erachtens klingt die Vier-Tage-Woche zwar sehr attraktiv, allerdings sehe ich dieses Modell bei vollem Gehalt eher kritisch.",
          insertDe:
            "Meines Erachtens klingt die Vier-Tage-Woche zwar sehr attraktiv, allerdings sehe ich dieses Modell bei vollem Gehalt eher kritisch. ",
          meaning:
            "In my view the four-day week sounds very attractive, however I view this model at full pay rather critically.",
          grammarHint:
            "Kompletter B2-Satz: Ersetze einfach „eher kritisch“ z. B. durch „als große Chance“ oder „positiv“.",
        },
        {
          patternDe:
            "Ich kann gut verstehen, dass sich viele Arbeitnehmer mehr Freizeit wünschen, aber ich bin der Meinung, dass die Vier-Tage-Woche nicht überall funktioniert.",
          insertDe:
            "Ich kann gut verstehen, dass sich viele Arbeitnehmer mehr Freizeit wünschen, aber ich bin der Meinung, dass die Vier-Tage-Woche nicht überall funktioniert. ",
          meaning:
            "I can well understand that many employees wish for more free time, but I think the four-day week doesn't work everywhere.",
          grammarHint:
            "Kompletter Satz mit zwei „dass“-Nebensätzen (Verb am Ende) — tausche einfach einzelne Wörter aus.",
        },
      ],
      vocab: [
        {
          german: "die Vier-Tage-Woche bei vollem Lohnausgleich",
          meaning: "the four-day week at full pay",
          matchTokens: ["vier-tage-woche", "gehalt", "lohnausgleich"],
        },
        {
          german: "einem Modell kritisch / offen gegenüberstehen",
          meaning: "to take a critical / open stance toward a model",
          matchTokens: ["kritisch", "offen", "gegenüber"],
        },
        {
          german: "meines Erachtens / meiner Ansicht nach",
          meaning: "in my view / opinion",
          matchTokens: ["erachtens", "ansicht", "meinung"],
        },
      ],
    },
    // Leitpunkt 2: Nennen Sie konkrete Gründe, warum viele Arbeitnehmer dieses Modell wünschen.
    {
      structures: [
        {
          patternDe:
            "Viele Arbeitnehmer wünschen sich dieses Arbeitsmodell, weil sie durch ein längeres Wochenende besser abschalten und neue Energie tanken können.",
          insertDe:
            "Viele Arbeitnehmer wünschen sich dieses Arbeitsmodell, weil sie durch ein längeres Wochenende besser abschalten und neue Energie tanken können. ",
          meaning:
            "Many employees want this work model because they can switch off better and recharge with a longer weekend.",
          grammarHint:
            "Kompletter „weil“-Satz (Modalverb „können“ am Ende) — passe den Grund nach Wunsch an.",
        },
        {
          patternDe:
            "Zudem sind ausgeruhte Mitarbeiter im Berufsalltag oft motivierter und können sich deutlich besser auf ihre Aufgaben konzentrieren.",
          insertDe:
            "Zudem sind ausgeruhte Mitarbeiter im Berufsalltag oft motivierter und können sich deutlich besser auf ihre Aufgaben konzentrieren. ",
          meaning:
            "Moreover, well-rested employees are often more motivated in daily work and can concentrate significantly better on their tasks.",
          grammarHint:
            "Kompletter Hauptsatz mit Verb auf Pos. 2 nach „Zudem“ + reflexives „sich konzentrieren auf“.",
        },
      ],
      vocab: [
        {
          german: "eine bessere Work-Life-Balance erreichen",
          meaning: "to achieve a better work-life balance",
          matchTokens: ["work-life-balance", "freizeit", "ausgleich"],
        },
        {
          german: "neue Energie tanken und Stress abbauen",
          meaning: "to recharge energy and reduce stress",
          matchTokens: ["energie", "stress", "entspannt", "erholen"],
        },
        {
          german: "sich konzentrierter der Arbeit widmen",
          meaning: "to dedicate oneself to work with more focus",
          matchTokens: ["konzentrier", "fokus", "produktiv"],
        },
      ],
    },
    // Leitpunkt 3: Erläutern Sie mindestens ein Risiko für Unternehmen oder bestimmte Branchen (z. B. Pflege, Handwerk).
    {
      structures: [
        {
          patternDe:
            "Ein wesentliches Risiko für Unternehmen besteht jedoch darin, dass die Personalkosten stark steigen, wenn die gleiche Arbeit in weniger Tagen erledigt werden muss.",
          insertDe:
            "Ein wesentliches Risiko für Unternehmen besteht jedoch darin, dass die Personalkosten stark steigen, wenn die gleiche Arbeit in weniger Tagen erledigt werden muss. ",
          meaning:
            "A major risk for companies, however, is that staffing costs rise sharply when the same work must be done in fewer days.",
          grammarHint:
            "Kompletter B2-Satz mit „darin, dass ...“ + Passiv mit Modalverb („erledigt werden muss“).",
        },
        {
          patternDe:
            "Besonders in Branchen wie der Pflege oder dem Handwerk ist dieses Modell kaum umsetzbar, da Patienten und Kunden rund um die Uhr betreut werden müssen.",
          insertDe:
            "Besonders in Branchen wie der Pflege oder dem Handwerk ist dieses Modell kaum umsetzbar, da Patienten und Kunden rund um die Uhr betreut werden müssen. ",
          meaning:
            "Especially in sectors like nursing or trades this model is hardly feasible, since patients and customers must be cared for around the clock.",
          grammarHint:
            "Kompletter „da“-Nebensatz — ersetze einfach die Branche oder den Grund nach Bedarf.",
        },
      ],
      vocab: [
        {
          german: "der akute Fachkräftemangel",
          meaning: "the acute shortage of skilled workers",
          matchTokens: ["fachkräfte", "mangel", "personal"],
        },
        {
          german: "kaum umsetzbar sein (in der Pflege / im Handwerk)",
          meaning: "to be hardly feasible (in nursing / skilled trades)",
          matchTokens: ["pflege", "handwerk", "umsetzbar", "branche"],
        },
        {
          german: "die Wettbewerbsfähigkeit gefährden",
          meaning: "to endanger competitiveness",
          matchTokens: ["wettbewerb", "kosten", "risiko", "unternehmen"],
        },
      ],
    },
    // Leitpunkt 4: Schlagen Sie flexible Alternativen vor.
    {
      structures: [
        {
          patternDe:
            "Statt einer starren Vier-Tage-Woche halte ich flexible Arbeitszeitmodelle wie Gleitzeit oder regelmäßiges Homeoffice für die bessere Lösung.",
          insertDe:
            "Statt einer starren Vier-Tage-Woche halte ich flexible Arbeitszeitmodelle wie Gleitzeit oder regelmäßiges Homeoffice für die bessere Lösung. ",
          meaning:
            "Instead of a rigid four-day week, I consider flexible working-time models like flextime or regular remote work to be the better solution.",
          grammarHint:
            "Kompletter Satz mit Genitiv nach „Statt“ + „etwas für ... halten“.",
        },
        {
          patternDe:
            "Abschließend lässt sich festhalten, dass jedes Unternehmen gemeinsam mit seinen Mitarbeitern individuelle und praxisnahe Lösungen entwickeln sollte.",
          insertDe:
            "Abschließend lässt sich festhalten, dass jedes Unternehmen gemeinsam mit seinen Mitarbeitern individuelle und praxisnahe Lösungen entwickeln sollte. ",
          meaning:
            "In conclusion it can be stated that every company should develop individual, practical solutions together with its employees.",
          grammarHint:
            "Starker B2-Schlusssatz mit „lässt sich festhalten, dass ...“.",
        },
      ],
      vocab: [
        {
          german: "Gleitzeit und Homeoffice kombinieren",
          meaning: "to combine flextime and remote work",
          matchTokens: ["gleitzeit", "homeoffice", "flexibel"],
        },
        {
          german: "eine individuelle Lösung finden",
          meaning: "to find an individual solution",
          matchTokens: ["lösung", "alternative", "kompromiss"],
        },
        {
          german: "auf die jeweilige Branche abstimmen",
          meaning: "to tailor to the respective industry",
          matchTokens: ["branche", "abstimmen", "anpassen"],
        },
      ],
    },
  ],

  // 1. Smartphones in der Schule (Aufgabe 2 — Forum)
  "bank-schreiben-b1-media-02": [
    {
      structures: [
        {
          patternDe:
            "Ich kann Julias Meinung gut verstehen, dass sie ein komplettes Handyverbot zu streng findet.",
          insertDe:
            "Ich kann Julias Meinung gut verstehen, dass sie ein komplettes Handyverbot zu streng findet. ",
          meaning:
            "I can understand Julia's opinion well that she finds a complete phone ban too strict.",
          grammarHint:
            "Kompletter „dass“-Satz — du kannst „zu streng“ einfach durch deine eigene Einschätzung ersetzen.",
        },
        {
          patternDe:
            "Meiner Meinung nach ist es jedoch nicht so schlimm, im Unterricht die Handys am Eingang abzugeben.",
          insertDe:
            "Meiner Meinung nach ist es jedoch nicht so schlimm, im Unterricht die Handys am Eingang abzugeben. ",
          meaning:
            "In my opinion, however, it is not so bad to hand in mobile phones at the entrance during class.",
          grammarHint:
            "Kompletter Satz mit „Meiner Meinung nach“ (Dativ!) + Infinitiv mit „abzugeben“.",
        },
      ],
      vocab: [
        {
          german: "ein komplettes Handyverbot",
          meaning: "a complete mobile phone ban",
          matchTokens: ["handyverbot", "verbot"],
        },
        {
          german: "die Regel zu streng finden",
          meaning: "to find the rule too strict",
          matchTokens: ["streng", "regel"],
        },
        {
          german: "das Handy am Eingang abgeben",
          meaning: "to hand in the phone at the entrance",
          matchTokens: ["abgeben", "abzugeben", "eingang"],
        },
        {
          german: "geteilter Meinung sein",
          meaning: "to have mixed feelings / divided opinion",
          matchTokens: ["meinung"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Einerseits können sich die Schüler ohne Smartphone besser auf den Unterricht konzentrieren, andererseits sind sie im Notfall für ihre Eltern schnell erreichbar.",
          insertDe:
            "Einerseits können sich die Schüler ohne Smartphone besser auf den Unterricht konzentrieren, andererseits sind sie im Notfall für ihre Eltern schnell erreichbar. ",
          meaning:
            "On one hand students can concentrate better in class without a smartphone, on the other hand they are quickly reachable for parents in an emergency.",
          grammarHint:
            "Kompletter Satz mit Verb auf Position 2 nach „Einerseits“ & „andererseits“ — tausche den Vorteil/Nachteil einfach aus.",
        },
        {
          patternDe:
            "Ein großer Vorteil ist, dass man mit Lern-Apps schnell Informationen im Internet recherchieren kann.",
          insertDe:
            "Ein großer Vorteil ist, dass man mit Lern-Apps schnell Informationen im Internet recherchieren kann. ",
          meaning:
            "A big advantage is that you can quickly research information on the internet using learning apps.",
          grammarHint: "Kompletter „dass“-Nebensatz mit „im Internet“.",
        },
      ],
      vocab: [
        {
          german: "sich auf den Unterricht konzentrieren",
          meaning: "to concentrate on class (reflexiv + auf + Akk.)",
          matchTokens: ["konzentrieren"],
        },
        {
          german: "durch Nachrichten abgelenkt werden",
          meaning: "to get distracted by messages/notifications",
          matchTokens: ["abgelenkt", "ablenken", "nachricht", "benachrichtigung"],
        },
        {
          german: "Informationen im Internet suchen",
          meaning: "to search for information on the internet ('im Internet'!)",
          matchTokens: ["internet", "recherchieren", "lösungen"],
        },
        {
          german: "im Notfall erreichbar sein",
          meaning: "to be reachable in an emergency",
          matchTokens: ["notfall", "erreichbar", "erreichen"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Ich halte eine Regel für sinnvoll, bei der die Handys während des Unterrichts ausgeschaltet bleiben und nur in den Pausen genutzt werden dürfen.",
          insertDe:
            "Ich halte eine Regel für sinnvoll, bei der die Handys während des Unterrichts ausgeschaltet bleiben und nur in den Pausen genutzt werden dürfen. ",
          meaning:
            "I consider a rule sensible in which phones stay switched off during class and may only be used during breaks.",
          grammarHint:
            "Kompletter Relativsatz mit „bei der“ — ersetze einfach die Bedingung nach Wunsch.",
        },
        {
          patternDe:
            "Wenn die Schüler im Unterricht kein Handy dabeihaben, fragen sie direkt den Lehrer oder die Lehrerin und lernen selbstständiger.",
          insertDe:
            "Wenn die Schüler im Unterricht kein Handy dabeihaben, fragen sie direkt den Lehrer oder die Lehrerin und lernen selbstständiger. ",
          meaning:
            "When students don't have a phone in class, they ask the teacher directly and learn more independently.",
          grammarHint: "Kompletter „Wenn“-Satz + Verb „fragen“ direkt nach dem Komma.",
        },
      ],
      vocab: [
        {
          german: "den Lehrer oder die Lehrerin fragen",
          meaning: "to ask the teacher (Akkusativ ohne „mit“!)",
          matchTokens: ["lehrer", "lehrerin", "lehrkraft", "fragen"],
        },
        {
          german: "selbstständig denken und lernen",
          meaning: "to think and learn independently",
          matchTokens: ["selbstständig", "lernen"],
        },
        {
          german: "nur in den Pausen erlauben",
          meaning: "to allow only during breaks",
          matchTokens: ["pause", "erlauben", "erlaubt"],
        },
        {
          german: "einen guten Kompromiss finden",
          meaning: "to find a good compromise",
          matchTokens: ["kompromiss", "sinnvoll"],
        },
      ],
    },
  ],

  // 2. Online-Shopping vs. Einkaufen im Geschäft (Aufgabe 2 — Forum)
  "bank-schreiben-b1-official-aufgabe2-02": [
    {
      structures: [
        {
          patternDe:
            "Ich kann Thomas gut verstehen, weil das Bestellen im Internet sehr bequem ist und man nach der Arbeit viel Zeit spart.",
          insertDe:
            "Ich kann Thomas gut verstehen, weil das Bestellen im Internet sehr bequem ist und man nach der Arbeit viel Zeit spart. ",
          meaning:
            "I can understand Thomas well because ordering online is very convenient and saves a lot of time after work.",
          grammarHint: "Kompletter „weil“-Satz mit „im Internet“ und Verb am Ende.",
        },
        {
          patternDe:
            "Im Gegensatz zu Thomas gehe ich trotzdem gern in die Innenstadt, denn dort kann man sich persönlich beraten lassen.",
          insertDe:
            "Im Gegensatz zu Thomas gehe ich trotzdem gern in die Innenstadt, denn dort kann man sich persönlich beraten lassen. ",
          meaning:
            "In contrast to Thomas I still like going downtown, because there you can get personal advice.",
          grammarHint: "Kompletter Satz mit „denn“ + Hauptsatz.",
        },
      ],
      vocab: [
        {
          german: "bequem von zu Hause aus bestellen",
          meaning: "to order conveniently from home",
          matchTokens: ["bequem", "bestellen"],
        },
        {
          german: "eine riesige Auswahl haben",
          meaning: "to have a huge selection",
          matchTokens: ["auswahl"],
        },
        {
          german: "Zeit und Stress sparen",
          meaning: "to save time and stress",
          matchTokens: ["sparen", "stress"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Bücher und Technik bestelle ich meistens online, während ich Kleidung und Schuhe lieber im Geschäft vor Ort anprobiere.",
          insertDe:
            "Bücher und Technik bestelle ich meistens online, während ich Kleidung und Schuhe lieber im Geschäft vor Ort anprobiere. ",
          meaning:
            "I mostly order books and electronics online, whereas I prefer trying on clothes and shoes in the local store.",
          grammarHint: "Kompletter Satz mit „während“ — tausche einfach die Produkte aus!",
        },
        {
          patternDe:
            "Im Geschäft vor Ort hat man den großen Vorteil, dass man die Qualität sofort prüfen kann.",
          insertDe:
            "Im Geschäft vor Ort hat man den großen Vorteil, dass man die Qualität sofort prüfen kann. ",
          meaning:
            "In the local store you have the big advantage that you can check the quality immediately.",
          grammarHint: "Kompletter „dass“-Satz mit Modalverb am Ende.",
        },
      ],
      vocab: [
        {
          german: "Kleidung und Schuhe anprobieren",
          meaning: "to try on clothes and shoes",
          matchTokens: ["anprobieren", "kleidung", "schuhe"],
        },
        {
          german: "sich persönlich beraten lassen",
          meaning: "to get personal advice from staff",
          matchTokens: ["beraten", "beratung"],
        },
        {
          german: "die Qualität sofort prüfen",
          meaning: "to check the quality immediately",
          matchTokens: ["qualität", "prüfen"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Ein großes Problem für die Umwelt ist, dass durch die vielen Pakete und Rücksendungen enorm viel Verpackungsmüll entsteht.",
          insertDe:
            "Ein großes Problem für die Umwelt ist, dass durch die vielen Pakete und Rücksendungen enorm viel Verpackungsmüll entsteht. ",
          meaning:
            "A big problem for the environment is that an enormous amount of packaging waste is created by the many parcels and returns.",
          grammarHint: "Kompletter „dass“-Satz mit Verb „entsteht“ am Ende.",
        },
        {
          patternDe:
            "Außerdem müssen viele kleine Geschäfte in der Innenstadt schließen, wenn es immer weniger Kunden vor Ort gibt.",
          insertDe:
            "Außerdem müssen viele kleine Geschäfte in der Innenstadt schließen, wenn es immer weniger Kunden vor Ort gibt. ",
          meaning:
            "Moreover, many small shops downtown have to close when there are fewer and fewer local customers.",
          grammarHint: "Kompletter „wenn“-Satz mit „es gibt“.",
        },
      ],
      vocab: [
        {
          german: "viel Verpackungsmüll verursachen",
          meaning: "to cause a lot of packaging waste",
          matchTokens: ["verpackungsmüll", "müll"],
        },
        {
          german: "kostenlose Rücksendungen (Retouren)",
          meaning: "free returns",
          matchTokens: ["rücksendung", "retoure", "zurückschicken"],
        },
        {
          german: "lokale Händler unterstützen",
          meaning: "to support local retailers",
          matchTokens: ["händler", "geschäfte", "unterstützen"],
        },
      ],
    },
  ],

  // 3. Wochenende / Straßenfest / Konzert (Aufgabe 1 — Informelle E-Mail)
  "bank-schreiben-b1-leisure-01": [
    {
      structures: [
        {
          patternDe:
            "Am letzten Wochenende war ich zum ersten Mal bei einem tollen Straßenfest in München, und es hat mir super gefallen.",
          insertDe:
            "Am letzten Wochenende war ich zum ersten Mal bei einem tollen Straßenfest in München, und es hat mir super gefallen. ",
          meaning:
            "Last weekend I was at a great street festival in Munich for the first time, and I really liked it.",
          grammarHint: "Kompletter Satz: Ersetze einfach „Straßenfest in München“ durch dein Event/deine Stadt.",
        },
        {
          patternDe:
            "Besonders gut hat mir gefallen, dass dort meine Lieblingsband live gespielt hat und die Stimmung fantastisch war.",
          insertDe:
            "Besonders gut hat mir gefallen, dass dort meine Lieblingsband live gespielt hat und die Stimmung fantastisch war. ",
          meaning:
            "I especially liked that my favorite band played live there and the atmosphere was fantastic.",
          grammarHint: "Kompletter „dass“-Satz im Perfekt/Präteritum.",
        },
      ],
      vocab: [
        {
          german: "ein buntes Straßenfest besuchen",
          meaning: "to visit a colorful street festival",
          matchTokens: ["straßenfest", "konzert", "fest"],
        },
        {
          german: "eine fantastische Stimmung",
          meaning: "a fantastic atmosphere",
          matchTokens: ["stimmung", "atmosphäre"],
        },
        {
          german: "meine Lieblingsband live hören",
          meaning: "to hear my favorite band live",
          matchTokens: ["lieblingsband", "band", "musik", "live"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Dieser Ausflug war für mich so besonders, weil ich endlich vom stressigen Alltag abschalten und viele nette Leute kennenlernen konnte.",
          insertDe:
            "Dieser Ausflug war für mich so besonders, weil ich endlich vom stressigen Alltag abschalten und viele nette Leute kennenlernen konnte. ",
          meaning:
            "This trip was so special for me because I could finally unwind from stressful daily life and meet many nice people.",
          grammarHint: "Kompletter „weil“-Satz — ersetze einfach den Grund nach Wunsch.",
        },
      ],
      vocab: [
        {
          german: "ein unvergessliches Erlebnis",
          meaning: "an unforgettable experience",
          matchTokens: ["erlebnis", "unvergesslich", "besonders"],
        },
        {
          german: "neue Leute kennenlernen",
          meaning: "to meet / get to know new people",
          matchTokens: ["kennenlernen", "kennengelernt", "leute"],
        },
        {
          german: "vom Alltag abschalten",
          meaning: "to switch off / relax from everyday life",
          matchTokens: ["alltag", "abschalten", "entspannen"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Hast du nächstes Wochenende Zeit, damit wir uns im Café treffen und ich dir alle meine Fotos zeigen kann?",
          insertDe:
            "Hast du nächstes Wochenende Zeit, damit wir uns im Café treffen und ich dir alle meine Fotos zeigen kann? ",
          meaning:
            "Do you have time next weekend so we can meet at the café and I can show you all my photos?",
          grammarHint: "Komplette Einladungsfrage mit „damit“.",
        },
      ],
      vocab: [
        {
          german: "dir die Fotos und Videos zeigen",
          meaning: "to show you the photos and videos",
          matchTokens: ["fotos", "zeigen"],
        },
        {
          german: "uns in unserem Lieblingscafé treffen",
          meaning: "to meet at our favorite café",
          matchTokens: ["treffen", "café", "kino"],
        },
      ],
    },
  ],

  // 4. Umzug in die neue Wohnung (Aufgabe 1 — Informelle E-Mail)
  "bank-schreiben-b1-official-aufgabe1-02": [
    {
      structures: [
        {
          patternDe:
            "Seit letzter Woche wohne ich endlich in meiner neuen Wohnung, die sehr hell ist und einen sonnigen Balkon hat.",
          insertDe:
            "Seit letzter Woche wohne ich endlich in meiner neuen Wohnung, die sehr hell ist und einen sonnigen Balkon hat. ",
          meaning:
            "Since last week I finally live in my new apartment, which is very bright and has a sunny balcony.",
          grammarHint: "Kompletter Relativsatz — passe einfach die Details deiner Wohnung an.",
        },
      ],
      vocab: [
        {
          german: "einen sonnigen Balkon haben",
          meaning: "to have a sunny balcony (Akkusativ!)",
          matchTokens: ["balkon", "sonnig", "hell"],
        },
        {
          german: "in einer ruhigen Nachbarschaft liegen",
          meaning: "to be located in a quiet neighborhood",
          matchTokens: ["nachbarschaft", "umgebung", "ruhig"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Ich bin mit dem Umzug sehr zufrieden, weil ich jetzt viel mehr Platz und einen kürzeren Arbeitsweg habe.",
          insertDe:
            "Ich bin mit dem Umzug sehr zufrieden, weil ich jetzt viel mehr Platz und einen kürzeren Arbeitsweg habe. ",
          meaning:
            "I am very satisfied with the move because I now have much more space and a shorter commute.",
          grammarHint: "Kompletter „weil“-Satz — tausche einfach den Grund aus.",
        },
      ],
      vocab: [
        {
          german: "einen kürzeren Arbeitsweg haben",
          meaning: "to have a shorter commute to work",
          matchTokens: ["arbeitsweg", "arbeit", "schneller"],
        },
        {
          german: "Kartons auspacken und Regale aufbauen",
          meaning: "to unpack boxes and assemble shelves",
          matchTokens: ["kartons", "möbel", "fehlt", "fehlen"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Deshalb möchte ich dich herzlich für nächsten Samstagabend zum Abendessen in meine neue Wohnung einladen!",
          insertDe:
            "Deshalb möchte ich dich herzlich für nächsten Samstagabend zum Abendessen in meine neue Wohnung einladen! ",
          meaning:
            "Therefore I would like to warmly invite you for dinner at my new apartment next Saturday evening!",
          grammarHint: "Kompletter Einladungssatz — passe Tag/Uhrzeit einfach an.",
        },
      ],
      vocab: [
        {
          german: "zum Abendessen einladen",
          meaning: "to invite to dinner",
          matchTokens: ["abendessen", "einladen"],
        },
        {
          german: "etwas Leckeres zusammen kochen",
          meaning: "to cook something delicious together",
          matchTokens: ["kochen", "leckeres"],
        },
      ],
    },
  ],

  // 5. Formelle Entschuldigung an die Kursleiterin (Aufgabe 3 — Formell)
  "bank-schreiben-b1-edu-03": [
    {
      structures: [
        {
          patternDe:
            "Sehr geehrte Frau Dr. Neumann, leider kann ich am kommenden Donnerstag nicht zum Unterricht kommen, weil ich einen wichtigen Arzttermin habe.",
          insertDe:
            "Sehr geehrte Frau Dr. Neumann,\n\nleider kann ich am kommenden Donnerstag nicht zum Unterricht kommen, weil ich einen wichtigen Arzttermin habe. ",
          meaning:
            "Dear Dr. Neumann, unfortunately I cannot come to class next Thursday because I have an important doctor's appointment.",
          grammarHint: "Komplette formelle Einleitung + Entschuldigung.",
        },
      ],
      vocab: [
        {
          german: "einen dringenden Arzttermin haben",
          meaning: "to have an urgent doctor's appointment",
          matchTokens: ["arzttermin", "termin", "arzt"],
        },
        {
          german: "um Ihr Verständnis bitten",
          meaning: "to ask for your understanding",
          matchTokens: ["verständnis", "entschuldigen", "entschuldigung"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Könnten Sie mir bitte kurz mitteilen, welches Thema Sie in der Stunde behandeln und welche Hausaufgaben wir bis nächste Woche machen müssen?",
          insertDe:
            "Könnten Sie mir bitte kurz mitteilen, welches Thema Sie in der Stunde behandeln und welche Hausaufgaben wir bis nächste Woche machen müssen?\n\nMit freundlichen Grüßen\n",
          meaning:
            "Could you please let me know briefly which topic you will cover in class and what homework we need to do by next week?",
          grammarHint: "Komplette höfliche Frage im Konjunktiv II + Fragezeichen!",
        },
      ],
      vocab: [
        {
          german: "die Hausaufgaben nachholen",
          meaning: "to catch up on the homework",
          matchTokens: ["hausaufgaben", "aufgabe"],
        },
        {
          german: "Mit freundlichen Grüßen",
          meaning: "Kind regards (formal closing)",
          matchTokens: ["freundlichen", "grüßen"],
        },
      ],
    },
  ],

  // 6. Formelle Nachricht an den Vermieter — Heizung defekt (Aufgabe 3 — Formell)
  "bank-schreiben-b1-living-04": [
    {
      structures: [
        {
          patternDe:
            "Sehr geehrter Herr Schuster, ich schreibe Ihnen, weil die Heizung in meinem Wohnzimmer seit gestern nicht mehr funktioniert, obwohl es draußen sehr kalt ist.",
          insertDe:
            "Sehr geehrter Herr Schuster,\n\nich schreibe Ihnen, weil die Heizung in meinem Wohnzimmer seit gestern nicht mehr funktioniert, obwohl es draußen sehr kalt ist. ",
          meaning:
            "Dear Mr. Schuster, I am writing because the heating in my living room hasn't worked since yesterday, even though it is very cold outside.",
          grammarHint: "Kompletter Satz mit „weil“ und „obwohl“.",
        },
      ],
      vocab: [
        {
          german: "nicht mehr funktionieren",
          meaning: "to no longer work / function",
          matchTokens: ["funktioniert", "funktionieren", "defekt", "kaputt"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Ich wäre Ihnen sehr dankbar, wenn Sie so schnell wie möglich einen Handwerker schicken könnten. Morgen zwischen 9 und 12 Uhr sowie am Freitag ab 16 Uhr bin ich zu Hause.",
          insertDe:
            "Ich wäre Ihnen sehr dankbar, wenn Sie so schnell wie möglich einen Handwerker schicken könnten. Morgen zwischen 9 und 12 Uhr sowie am Freitag ab 16 Uhr bin ich zu Hause.\n\nMit freundlichen Grüßen\n",
          meaning:
            "I would be very grateful if you could send a technician as soon as possible. Tomorrow between 9 and 12 and Friday from 4 PM I am at home.",
          grammarHint: "Komplette höfliche Bitte mit zwei konkreten Uhrzeiten.",
        },
      ],
      vocab: [
        {
          german: "einen Handwerker schicken",
          meaning: "to send a repairman / technician",
          matchTokens: ["handwerker", "techniker", "reparatur", "reparieren"],
        },
      ],
    },
  ],

  // 7. Formelle Terminabsage an die Wohnungsbaugesellschaft (Aufgabe 3 — Formell)
  "bank-schreiben-b1-official-aufgabe3-03": [
    {
      structures: [
        {
          patternDe:
            "Sehr geehrte Frau Schneider, leider muss ich unseren Besichtigungstermin am kommenden Dienstag um 10:00 Uhr kurzfristig absagen, weil ich auf eine Dienstreise fahren muss.",
          insertDe:
            "Sehr geehrte Frau Schneider,\n\nleider muss ich unseren Besichtigungstermin am kommenden Dienstag um 10:00 Uhr kurzfristig absagen, weil ich auf eine Dienstreise fahren muss. ",
          meaning:
            "Dear Ms. Schneider, unfortunately I have to cancel our viewing appointment next Tuesday at 10 AM at short notice because I have to go on a business trip.",
          grammarHint: "Komplette formelle Absage + Begründung mit „weil“.",
        },
      ],
      vocab: [
        {
          german: "kurzfristig auf eine Dienstreise müssen",
          meaning: "to have to go on a business trip at short notice",
          matchTokens: ["dienstreise", "geschäftsreise", "kurzfristig"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Wäre es möglich, den Besichtigungstermin auf Donnerstag- oder Freitagnachmittag zu verschieben?",
          insertDe:
            "Wäre es möglich, den Besichtigungstermin auf Donnerstag- oder Freitagnachmittag zu verschieben?\n\nMit freundlichen Grüßen\n",
          meaning:
            "Would it be possible to reschedule the viewing appointment to Thursday or Friday afternoon?",
          grammarHint: "Komplette höfliche Frage im Konjunktiv II.",
        },
      ],
      vocab: [
        {
          german: "den Termin verschieben",
          meaning: "to reschedule / postpone the appointment",
          matchTokens: ["verschieben", "termin"],
        },
      ],
    },
  ],

  // 8. Modelltest 3 — Aufgabe 1: 10-km-Stadtlauf
  "bank-schreiben-b1-mt3-aufgabe1": [
    {
      structures: [
        {
          patternDe:
            "Am letzten Sonntag habe ich zum ersten Mal am Zehn-Kilometer-Stadtlauf teilgenommen, nachdem ich dafür zwei Monate lang regelmäßig im Park trainiert hatte.",
          insertDe:
            "Am letzten Sonntag habe ich zum ersten Mal am Zehn-Kilometer-Stadtlauf teilgenommen, nachdem ich dafür zwei Monate lang regelmäßig im Park trainiert hatte. ",
          meaning:
            "Last Sunday I participated in the 10 km city run for the first time after training regularly in the park for two months.",
          grammarHint: "Kompletter Satz mit Perfekt + „nachdem“.",
        },
      ],
      vocab: [
        {
          german: "am Stadtlauf teilnehmen",
          meaning: "to participate in the city run",
          matchTokens: ["stadtlauf", "teilgenommen", "lauf"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Die Veranstaltung hat mir besonders gut gefallen, weil die Zuschauer am Straßenrand alle Läufer laut angefeuert haben.",
          insertDe:
            "Die Veranstaltung hat mir besonders gut gefallen, weil die Zuschauer am Straßenrand alle Läufer laut angefeuert haben. ",
          meaning:
            "I especially liked the event because the spectators along the route cheered all runners on loudly.",
          grammarHint: "Kompletter „weil“-Satz im Perfekt.",
        },
      ],
      vocab: [
        {
          german: "eine großartige Atmosphäre",
          meaning: "a great atmosphere",
          matchTokens: ["stimmung", "atmosphäre", "strecke"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Hättest du Lust, ab nächstem Monat gemeinsam mit mir für den nächsten Stadtlauf zu trainieren?",
          insertDe:
            "Hättest du Lust, ab nächstem Monat gemeinsam mit mir für den nächsten Stadtlauf zu trainieren? ",
          meaning:
            "Would you feel like training together with me next month for the next city run?",
          grammarHint: "Komplette Einladungsfrage mit „zu + Infinitiv“.",
        },
      ],
      vocab: [
        {
          german: "gemeinsam trainieren",
          meaning: "to train together",
          matchTokens: ["gemeinsam", "zusammen", "trainieren"],
        },
      ],
    },
  ],

  // 9. Modelltest 3 — Aufgabe 2: Soziales Pflichtjahr
  "bank-schreiben-b1-mt3-aufgabe2": [
    {
      structures: [
        {
          patternDe:
            "Ich stimme Sabine teilweise zu, dass soziale Arbeit sehr wertvoll ist, aber meiner Meinung nach sollte ein soziales Jahr freiwillig bleiben.",
          insertDe:
            "Ich stimme Sabine teilweise zu, dass soziale Arbeit sehr wertvoll ist, aber meiner Meinung nach sollte ein soziales Jahr freiwillig bleiben. ",
          meaning:
            "Option A (Balanced): I partly agree with Sabine that social work is very valuable, but in my opinion a social year should remain voluntary.",
          grammarHint: "Kompletter Satz — tausche einfach „freiwillig“ / „Pflicht“ aus.",
        },
        {
          patternDe:
            "Ich kann Sabines Beitrag gut nachvollziehen und finde ebenfalls, dass ein soziales Jahr für junge Menschen sehr sinnvoll ist.",
          insertDe:
            "Ich kann Sabines Beitrag gut nachvollziehen und finde ebenfalls, dass ein soziales Jahr für junge Menschen sehr sinnvoll ist. ",
          meaning:
            "Option B (Agree / Pro): I can relate well to Sabine's post and also think a social year is very worthwhile for young people.",
          grammarHint: "Zustimmung + „dass“-Nebensatz (Verb am Ende).",
        },
        {
          patternDe:
            "Ich habe Sabines Kommentar mit Interesse gelesen, sehe ein verpflichtendes soziales Jahr jedoch deutlich kritischer als sie.",
          insertDe:
            "Ich habe Sabines Kommentar mit Interesse gelesen, sehe ein verpflichtendes soziales Jahr jedoch deutlich kritischer als sie. ",
          meaning:
            "Option C (Disagree / Critical): I read Sabine's comment with interest, yet I view a mandatory social year much more critically than she does.",
          grammarHint: "Höflicher Widerspruch mit „jedoch“ + Komparativ.",
        },
      ],
      vocab: [
        {
          german: "ein freiwilliges soziales Jahr",
          meaning: "a voluntary social year",
          matchTokens: ["freiwillig", "pflichtjahr", "soziales"],
        },
        {
          german: "jemandem teilweise zustimmen",
          meaning: "to partly agree with someone (Dativ)",
          matchTokens: ["zustimmen", "stimme", "nachvollziehen"],
        },
        {
          german: "kritisch gegenüberstehen",
          meaning: "to take a critical stance toward (Dativ)",
          matchTokens: ["kritisch", "kritischer", "dagegen"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "Einerseits sammeln Jugendliche dabei wertvolle Lebenserfahrung, andererseits verlieren sie ein ganzes Jahr vor ihrem Studium oder ihrer Ausbildung.",
          insertDe:
            "Einerseits sammeln Jugendliche dabei wertvolle Lebenserfahrung, andererseits verlieren sie ein ganzes Jahr vor ihrem Studium oder ihrer Ausbildung. ",
          meaning:
            "Option A (Balanced Pro & Contra): On one hand young people gain valuable life experience, on the other hand they lose a whole year before university or training.",
          grammarHint: "Kompletter „Einerseits ... andererseits“-Satz.",
        },
        {
          patternDe:
            "Ein großer Vorteil ist, dass junge Leute soziale Verantwortung übernehmen und wichtige Berufe in der Pflege kennenlernen.",
          insertDe:
            "Ein großer Vorteil ist, dass junge Leute soziale Verantwortung übernehmen und wichtige Berufe in der Pflege kennenlernen. ",
          meaning:
            "Option B (Focus on Advantage): A big advantage is that young people take on social responsibility and get to know important care professions.",
          grammarHint: "„Ein großer Vorteil ist, dass ...“ (Verb am Ende).",
        },
        {
          patternDe:
            "Ein deutlicher Nachteil besteht allerdings darin, dass Zwang oft zu geringer Motivation führt und viele Jugendliche lieber sofort studieren möchten.",
          insertDe:
            "Ein deutlicher Nachteil besteht allerdings darin, dass Zwang oft zu geringer Motivation führt und viele Jugendliche lieber sofort studieren möchten. ",
          meaning:
            "Option C (Focus on Disadvantage): A clear disadvantage, however, is that compulsion often leads to low motivation and many young people prefer to start studying right away.",
          grammarHint: "„Ein Nachteil besteht darin, dass ...“ (B1/B2-Struktur).",
        },
      ],
      vocab: [
        {
          german: "soziale Verantwortung übernehmen",
          meaning: "to take on social responsibility",
          matchTokens: ["verantwortung", "übernehmen"],
        },
        {
          german: "wertvolle Lebenserfahrung sammeln",
          meaning: "to gain valuable life experience",
          matchTokens: ["lebenserfahrung", "erfahrung", "sammeln"],
        },
        {
          german: "unter Zwang wenig motiviert sein",
          meaning: "to have little motivation under compulsion",
          matchTokens: ["zwang", "motivation", "motiviert"],
        },
      ],
    },
    {
      structures: [
        {
          patternDe:
            "In meinem Heimatland gibt es kein Pflichtjahr, und ich fände es besser, wenn freiwillige Helfer stattdessen besser bezahlt würden.",
          insertDe:
            "In meinem Heimatland gibt es kein Pflichtjahr, und ich fände es besser, wenn freiwillige Helfer stattdessen besser bezahlt würden. ",
          meaning:
            "Option A (Home country + better pay): In my home country there is no mandatory year, and I would find it better if volunteers were paid better instead.",
          grammarHint: "Kompletter Satz im Konjunktiv II.",
        },
        {
          patternDe:
            "Bei uns ist soziales Engagement zwar freiwillig, aber viele Schulen und Universitäten belohnen ehrenamtliche Arbeit mit Pluspunkten.",
          insertDe:
            "Bei uns ist soziales Engagement zwar freiwillig, aber viele Schulen und Universitäten belohnen ehrenamtliche Arbeit mit Pluspunkten. ",
          meaning:
            "Option B (Voluntary + incentives): In our country social engagement is voluntary, yet many schools and universities reward volunteer work with extra credit.",
          grammarHint: "Kompletter „zwar ..., aber ...“-Satz.",
        },
        {
          patternDe:
            "Meiner Ansicht nach wäre ein flexibler Kompromiss am besten, zum Beispiel ein kurzes soziales Praktikum von zwei bis drei Monaten.",
          insertDe:
            "Meiner Ansicht nach wäre ein flexibler Kompromiss am besten, zum Beispiel ein kurzes soziales Praktikum von zwei bis drei Monaten. ",
          meaning:
            "Option C (Flexible compromise): In my view a flexible compromise would be best, for example a short social internship of two to three months.",
          grammarHint: "Konjunktiv II („wäre ... am besten“) + konkretes Beispiel.",
        },
      ],
      vocab: [
        {
          german: "in meinem Heimatland freiwillig sein",
          meaning: "to be voluntary in my home country",
          matchTokens: ["heimatland", "geregelt", "freiwillig"],
        },
        {
          german: "ehrenamtliche Arbeit belohnen",
          meaning: "to reward voluntary / charity work",
          matchTokens: ["ehrenamtlich", "belohnen", "bezahlt"],
        },
        {
          german: "einen flexiblen Kompromiss vorschlagen",
          meaning: "to propose a flexible compromise",
          matchTokens: ["kompromiss", "praktikum", "flexibel"],
        },
      ],
    },
  ],
};

// Alias Modelltest IDs
CURATED_TASK_TOOLBOXES["mt1-schreiben-1"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-leisure-01"];
CURATED_TASK_TOOLBOXES["mt1-schreiben-2"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-media-02"];
CURATED_TASK_TOOLBOXES["mt1-schreiben-3"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-edu-03"];
CURATED_TASK_TOOLBOXES["mt2-schreiben-1"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe1-02"];
CURATED_TASK_TOOLBOXES["mt2-schreiben-2"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe2-02"];
CURATED_TASK_TOOLBOXES["mt2-schreiben-3"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe3-03"];
CURATED_TASK_TOOLBOXES["mt3-schreiben-1"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-mt3-aufgabe1"];
CURATED_TASK_TOOLBOXES["mt3-schreiben-2"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-mt3-aufgabe2"];
CURATED_TASK_TOOLBOXES["mt3-schreiben-3"] =
  CURATED_TASK_TOOLBOXES["bank-schreiben-b1-living-04"];

/**
 * Smart intent-based fallback generator returning COMPLETE, customizable German sentences
 * (no incomplete "... [Verb am Ende]" blanks!) for any custom/AI writing task.
 */
function buildDynamicBulletToolbox(
  exercise: SkillDrillExercise,
  bulletDe: string,
  bulletIndex: number
): LeitpunktToolboxData {
  const bLower = bulletDe.toLowerCase();
  const promptLower = (exercise.writingPromptDe || "").toLowerCase();
  const isFormal =
    exercise.examPartNumber === 3 ||
    promptLower.includes("sehr geehrte") ||
    promptLower.includes("kursleiterin") ||
    promptLower.includes("vermieter") ||
    promptLower.includes("frau ") ||
    promptLower.includes("herrn ");

  const structures: LeitpunktStructureSuggestion[] = [];
  const vocab: LeitpunktVocabSuggestion[] = [];

  if (
    bLower.includes("beziehen sie sich") ||
    bLower.includes("aussage von") ||
    bLower.includes("beitrag von") ||
    bLower.includes("eigene meinung") ||
    bLower.includes("haltung")
  ) {
    structures.push(
      {
        patternDe:
          "Ich kann diese Meinung gut verstehen, weil sie wichtige Punkte anspricht, aber ich sehe das Thema etwas kritischer.",
        insertDe:
          "Ich kann diese Meinung gut verstehen, weil sie wichtige Punkte anspricht, aber ich sehe das Thema etwas kritischer. ",
        meaning:
          "Option A (Balanced): I can understand this opinion well because it raises important points, but I view the topic somewhat more critically.",
        grammarHint:
          "Kompletter Satz zum Anpassen: Ersetze einfach „etwas kritischer“ durch deine eigene Haltung.",
      },
      {
        patternDe:
          "Meiner Meinung nach ist dieses Thema sehr aktuell, weil es unseren Alltag und unsere Zukunft direkt beeinflusst.",
        insertDe:
          "Meiner Meinung nach ist dieses Thema sehr aktuell, weil es unseren Alltag und unsere Zukunft direkt beeinflusst. ",
        meaning:
          "Option B (Clear Stance): In my opinion this topic is very current because it directly influences our everyday life and future.",
        grammarHint: "Kompletter „weil“-Satz mit „Meiner Meinung nach“ (Dativ).",
      },
      {
        patternDe:
          "Ich stimme diesem Beitrag grundsätzlich zu, möchte aber hinzufügen, dass man dabei auch die praktischen Folgen bedenken sollte.",
        insertDe:
          "Ich stimme diesem Beitrag grundsätzlich zu, möchte aber hinzufügen, dass man dabei auch die praktischen Folgen bedenken sollte. ",
        meaning:
          "Option C (Agree + Nuance): I basically agree with this post, but would like to add that one should also consider the practical consequences.",
        grammarHint: "Zustimmung + „dass“-Nebensatz mit Modalverb.",
      }
    );
    vocab.push(
      {
        german: "jemandem teilweise zustimmen",
        meaning: "to partly agree with someone (Dativ)",
        matchTokens: ["zustimmen", "stimme"],
      },
      {
        german: "meiner Ansicht nach",
        meaning: "in my view / opinion",
        matchTokens: ["meinung", "ansicht"],
      },
      {
        german: "einen wichtigen Punkt ansprechen",
        meaning: "to raise an important point",
        matchTokens: ["punkt", "anspricht", "ansprechen"],
      }
    );
  } else if (
    bLower.includes("vorteil") ||
    bLower.includes("nachteil") ||
    bLower.includes("risiko") ||
    bLower.includes("folgen")
  ) {
    structures.push(
      {
        patternDe:
          "Einerseits bietet dieses Modell den großen Vorteil, dass man mehr Freizeit hat, andererseits steigen dadurch oft die Kosten für die Unternehmen.",
        insertDe:
          "Einerseits bietet dieses Modell den großen Vorteil, dass man mehr Freizeit hat, andererseits steigen dadurch oft die Kosten für die Unternehmen. ",
        meaning:
          "Option A (Balanced): On one hand this model offers the big advantage of having more free time, on the other hand costs for companies often rise.",
        grammarHint:
          "Kompletter „Einerseits ... andererseits“-Satz — tausche einfach Vorteil und Nachteil aus.",
      },
      {
        patternDe:
          "Ein wesentliches Risiko besteht jedoch darin, dass kleine Betriebe zu wenig Personal haben.",
        insertDe:
          "Ein wesentliches Risiko besteht jedoch darin, dass kleine Betriebe zu wenig Personal haben. ",
        meaning:
          "Option B (Risk / Contra): A major risk, however, is that small businesses have too little staff.",
        grammarHint: "Kompletter „dass“-Satz — ersetze einfach das konkrete Risiko.",
      },
      {
        patternDe:
          "Positiv hervorzuheben ist, dass dadurch die Zufriedenheit und die Lebensqualität vieler Menschen deutlich steigen.",
        insertDe:
          "Positiv hervorzuheben ist, dass dadurch die Zufriedenheit und die Lebensqualität vieler Menschen deutlich steigen. ",
        meaning:
          "Option C (Positive Aspect): On the positive side, this significantly increases the satisfaction and quality of life of many people.",
        grammarHint: "Kompletter Satz mit „dass“ für Vorteile.",
      }
    );
    vocab.push(
      {
        german: "Vor- und Nachteile abwägen",
        meaning: "to weigh advantages and disadvantages",
        matchTokens: ["vorteil", "nachteil"],
      },
      {
        german: "eine negative Auswirkung haben",
        meaning: "to have a negative impact",
        matchTokens: ["auswirkung", "folge", "risiko"],
      },
      {
        german: "die Lebensqualität verbessern",
        meaning: "to improve quality of life",
        matchTokens: ["lebensqualität", "zufriedenheit", "verbessern"],
      }
    );
  } else if (
    bLower.includes("entschuldigen") ||
    bLower.includes("absagen") ||
    bLower.includes("krank")
  ) {
    structures.push(
      {
        patternDe: isFormal
          ? "Ich möchte mich höflich dafür entschuldigen, dass ich den Termin am kommenden Donnerstag leider nicht wahrnehmen kann."
          : "Es tut mir wirklich leid, dass ich heute wegen starker Kopfschmerzen leider nicht kommen kann.",
        insertDe: isFormal
          ? "Ich möchte mich höflich dafür entschuldigen, dass ich den Termin am kommenden Donnerstag leider nicht wahrnehmen kann. "
          : "Es tut mir wirklich leid, dass ich heute wegen starker Kopfschmerzen leider nicht kommen kann. ",
        meaning: "Option A (Polite Apology): I would like to apologize that I unfortunately cannot attend...",
        grammarHint: "Kompletter Entschuldigungssatz — passe Tag und Grund einfach an.",
      },
      {
        patternDe: isFormal
          ? "Leider muss ich unseren Termin kurzfristig absagen, weil ein dringender beruflicher Termin dazwischengekommen ist."
          : "Leider muss ich unser Treffen heute absagen, weil ich plötzlich krank geworden bin.",
        insertDe: isFormal
          ? "Leider muss ich unseren Termin kurzfristig absagen, weil ein dringender beruflicher Termin dazwischengekommen ist. "
          : "Leider muss ich unser Treffen heute absagen, weil ich plötzlich krank geworden bin. ",
        meaning: "Option B (Direct + Reason): Unfortunately I have to cancel at short notice because...",
        grammarHint: "„Leider muss ich ... absagen, weil ...“ (Verb am Ende).",
      },
      {
        patternDe: isFormal
          ? "Ich bitte vielmals um Ihr Verständnis für diese kurzfristige Änderung und entschuldige mich für eventuelle Unannehmlichkeiten."
          : "Hoffentlich bist du mir deswegen nicht böse — ich mache das beim nächsten Mal wieder gut!",
        insertDe: isFormal
          ? "Ich bitte vielmals um Ihr Verständnis für diese kurzfristige Änderung und entschuldige mich für eventuelle Unannehmlichkeiten. "
          : "Hoffentlich bist du mir deswegen nicht böse — ich mache das beim nächsten Mal wieder gut! ",
        meaning: isFormal
          ? "Option C (Ask for understanding): I kindly ask for your understanding for this short-notice change and apologize for any inconvenience."
          : "Option C (Warm informal): Hopefully you're not upset with me — I'll make it up to you next time!",
        grammarHint: "Passende höfliche/freundliche Abrundung der Entschuldigung.",
      }
    );
    vocab.push(
      {
        german: "kurzfristig absagen müssen",
        meaning: "to have to cancel at short notice",
        matchTokens: ["absagen", "kommen"],
      },
      {
        german: "um Ihr Verständnis bitten",
        meaning: "to ask for your understanding",
        matchTokens: ["verständnis", "entschuldigen"],
      },
      {
        german: "den Termin nicht wahrnehmen können",
        meaning: "to be unable to keep the appointment",
        matchTokens: ["wahrnehmen", "termin"],
      }
    );
  } else if (
    bLower.includes("vorschlag") ||
    bLower.includes("schlagen sie") ||
    bLower.includes("laden sie") ||
    bLower.includes("bitten sie") ||
    bLower.includes("fragen sie") ||
    bLower.includes("welche regel") ||
    bLower.includes("alternativen")
  ) {
    structures.push(
      {
        patternDe: isFormal
          ? "Könnten Sie mir bitte kurz mitteilen, ob ein Ersatztermin am Ende der Woche möglich wäre?"
          : "Ich schlage vor, dass wir stattdessen eine flexible Lösung finden, die für alle gut passt.",
        insertDe: isFormal
          ? "Könnten Sie mir bitte kurz mitteilen, ob ein Ersatztermin am Ende der Woche möglich wäre? "
          : "Ich schlage vor, dass wir stattdessen eine flexible Lösung finden, die für alle gut passt. ",
        meaning: isFormal
          ? "Option A (Polite Request): Could you please let me know briefly whether a replacement date at the end of the week would be possible?"
          : "Option A (Suggestion): I suggest that we find a flexible solution instead that works well for everyone.",
        grammarHint: "Kompletter Vorschlagssatz — ersetze einfach deinen konkreten Vorschlag.",
      },
      {
        patternDe: isFormal
          ? "Wäre es möglich, unseren Termin auf Donnerstag- oder Freitagnachmittag zu verschieben?"
          : "Wie wäre es, wenn wir uns nächstes Wochenende treffen und alles in Ruhe besprechen?",
        insertDe: isFormal
          ? "Wäre es möglich, unseren Termin auf Donnerstag- oder Freitagnachmittag zu verschieben? "
          : "Wie wäre es, wenn wir uns nächstes Wochenende treffen und alles in Ruhe besprechen? ",
        meaning: isFormal
          ? "Option B (Konjunktiv II Reschedule): Would it be possible to reschedule our appointment to Thursday or Friday afternoon?"
          : "Option B (Informal Invitation): How about we meet next weekend and talk everything over calmly?",
        grammarHint: "Höfliche Frage im Konjunktiv II („Wäre es möglich...“ / „Wie wäre es, wenn...“).",
      },
      {
        patternDe: isFormal
          ? "Über eine kurze Rückmeldung mit einem passenden Terminvorschlag würde ich mich sehr freuen."
          : "Am sinnvollsten fände ich einen fairen Kompromiss, bei dem beide Seiten zufrieden sind.",
        insertDe: isFormal
          ? "Über eine kurze Rückmeldung mit einem passenden Terminvorschlag würde ich mich sehr freuen. "
          : "Am sinnvollsten fände ich einen fairen Kompromiss, bei dem beide Seiten zufrieden sind. ",
        meaning: isFormal
          ? "Option C (Closing Request): I would be very happy to receive a brief reply with a suitable appointment suggestion."
          : "Option C (Compromise): I would find a fair compromise most sensible where both sides are satisfied.",
        grammarHint: "Konjunktiv II („würde mich freuen“ / „fände ich“).",
      }
    );
    vocab.push(
      {
        german: "einen guten Kompromiss finden",
        meaning: "to find a good compromise",
        matchTokens: ["kompromiss", "lösung", "regel", "alternative"],
      },
      {
        german: "einen Ersatztermin vorschlagen",
        meaning: "to suggest a replacement appointment",
        matchTokens: ["ersatztermin", "termin", "verschieben"],
      },
      {
        german: "über eine Rückmeldung freuen",
        meaning: "to be glad about a reply",
        matchTokens: ["rückmeldung", "antwort", "freuen"],
      }
    );
  } else if (
    bLower.includes("heimatland") ||
    bLower.includes("geregelt") ||
    bLower.includes("besser fänden")
  ) {
    structures.push(
      {
        patternDe:
          "In meinem Heimatland ist dieses Thema anders geregelt, weil dort die meisten Menschen frei entscheiden können.",
        insertDe:
          "In meinem Heimatland ist dieses Thema anders geregelt, weil dort die meisten Menschen frei entscheiden können. ",
        meaning:
          "Option A (Contrast with Home Country): In my home country this topic is regulated differently because most people can decide freely there.",
        grammarHint: "Vergleich mit dem Heimatland + „weil“-Satz.",
      },
      {
        patternDe:
          "Bei uns spielt diese Frage ebenfalls eine große Rolle, weshalb es viele ähnliche Diskussionen gibt.",
        insertDe:
          "Bei uns spielt diese Frage ebenfalls eine große Rolle, weshalb es viele ähnliche Diskussionen gibt. ",
        meaning:
          "Option B (Similarity): In our country this question also plays a big role, which is why there are many similar discussions.",
        grammarHint: "Kompletter Satz mit „weshalb“ (Verb am Ende).",
      },
      {
        patternDe:
          "Ich fände es persönlich am besten, wenn man gute Anreize schafft, statt strenge Regeln vorzuschreiben.",
        insertDe:
          "Ich fände es persönlich am besten, wenn man gute Anreize schafft, statt strenge Regeln vorzuschreiben. ",
        meaning:
          "Option C (Personal Preference): Personally I would find it best if good incentives were created instead of prescribing strict rules.",
        grammarHint: "Konjunktiv II + „statt ... zu + Infinitiv“.",
      }
    );
    vocab.push(
      {
        german: "in meinem Heimatland üblich sein",
        meaning: "to be common in my home country",
        matchTokens: ["heimatland", "üblich", "geregelt"],
      },
      {
        german: "eine wichtige Rolle spielen",
        meaning: "to play an important role",
        matchTokens: ["rolle", "spielen"],
      },
      {
        german: "Anreize schaffen",
        meaning: "to create incentives",
        matchTokens: ["anreiz", "anreize", "besser"],
      }
    );
  } else {
    structures.push(
      {
        patternDe:
          "Der wichtigste Grund dafür ist, dass diese Erfahrung sehr motivierend und unvergesslich für mich war.",
        insertDe:
          "Der wichtigste Grund dafür ist, dass diese Erfahrung sehr motivierend und unvergesslich für mich war. ",
        meaning:
          "Option A (Main Reason): The most important reason for this is that this experience was very motivating and unforgettable for me.",
        grammarHint: "Kompletter „dass“-Satz — tausche einfach den konkreten Grund aus.",
      },
      {
        patternDe:
          "Besonders gut hat mir gefallen, dass die Stimmung fantastisch war und ich viele nette Menschen kennengelernt habe.",
        insertDe:
          "Besonders gut hat mir gefallen, dass die Stimmung fantastisch war und ich viele nette Menschen kennengelernt habe. ",
        meaning:
          "Option B (Highlight / Experience): What I liked especially was that the atmosphere was fantastic and I met many nice people.",
        grammarHint: "Perfekt + „dass“-Nebensatz zum Beschreiben von Erlebnissen.",
      },
      {
        patternDe:
          "Außerdem spielt es eine große Rolle, dass man dabei Neues lernt und gleichzeitig viel Spaß hat.",
        insertDe:
          "Außerdem spielt es eine große Rolle, dass man dabei Neues lernt und gleichzeitig viel Spaß hat. ",
        meaning:
          "Option C (Additional Point): Furthermore it plays a big role that you learn something new and have a lot of fun at the same time.",
        grammarHint: "Satzverbindung mit „Außerdem“ + „dass“-Satz.",
      }
    );
    vocab.push(
      {
        german: "eine wichtige Rolle spielen",
        meaning: "to play an important role",
        matchTokens: ["rolle", "wichtig", "besonders"],
      },
      {
        german: "eine tolle Erfahrung machen",
        meaning: "to have a great experience",
        matchTokens: ["erfahrung", "stimmung", "gefallen"],
      },
      {
        german: "besonders gut gefallen",
        meaning: "to like especially well",
        matchTokens: ["besonders", "gefallen"],
      }
    );
  }

  const exVocab = exercise.keyVocab[bulletIndex] ?? exercise.keyVocab[0];
  if (exVocab && !vocab.some((v) => v.german === exVocab.german)) {
    vocab.unshift({
      german: exVocab.german,
      meaning: exVocab.meaning,
    });
  }

  return { structures, vocab };
}

export function getLeitpunktToolbox(
  exercise: SkillDrillExercise,
  bulletDe: string,
  bulletIndex: number,
  extraAi?: {
    structures?: LeitpunktStructureSuggestion[];
    vocab?: LeitpunktVocabSuggestion[];
  }
): LeitpunktToolboxData {
  let baseList = CURATED_TASK_TOOLBOXES[exercise.id];
  if (!baseList) {
    const p = (exercise.writingPromptDe || "").toLowerCase();
    if (p.includes("vier-tage-woche")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b2-work-06"];
    } else if (p.includes("smartphones in der schule") || p.includes("julia_m")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-media-02"];
    } else if (p.includes("online-shopping") || p.includes("thomas_k")) {
      baseList =
        CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe2-02"];
    } else if (p.includes("neue wohnung umgezogen") || p.includes("elena")) {
      baseList =
        CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe1-02"];
    } else if (p.includes("straßenfest") || p.includes("konzert")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-leisure-01"];
    } else if (p.includes("stadtlauf") || p.includes("zehn-kilometer")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-mt3-aufgabe1"];
    } else if (p.includes("pflichtjahr") || p.includes("sabine_w")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-mt3-aufgabe2"];
    } else if (p.includes("neumann") || p.includes("kursleiterin")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-edu-03"];
    } else if (p.includes("heizung") || p.includes("schuster")) {
      baseList = CURATED_TASK_TOOLBOXES["bank-schreiben-b1-living-04"];
    } else if (
      p.includes("wohnungsbesichtigung") ||
      p.includes("frau schneider")
    ) {
      baseList =
        CURATED_TASK_TOOLBOXES["bank-schreiben-b1-official-aufgabe3-03"];
    }
  }

  const dynamicFallback = buildDynamicBulletToolbox(
    exercise,
    bulletDe,
    bulletIndex
  );
  const base = baseList?.[bulletIndex] ?? dynamicFallback;

  // Put AI-generated sentences FIRST, then curated task-specific sentences, then top up from
  // dynamic intent-matched options so EVERY Leitpunkt ALWAYS has at least 3 distinct options!
  const mergedStructures: LeitpunktStructureSuggestion[] = [];
  const pushStructure = (s: LeitpunktStructureSuggestion) => {
    if (
      s.patternDe &&
      !mergedStructures.some(
        (ex) => ex.patternDe.toLowerCase() === s.patternDe.toLowerCase()
      )
    ) {
      mergedStructures.push(s);
    }
  };

  for (const s of [...(extraAi?.structures ?? []), ...base.structures]) {
    pushStructure(s);
  }
  if (mergedStructures.length < 3) {
    for (const s of dynamicFallback.structures) {
      pushStructure(s);
      if (mergedStructures.length >= 3) break;
    }
  }

  const mergedVocab: LeitpunktVocabSuggestion[] = [];
  const pushVocab = (v: LeitpunktVocabSuggestion) => {
    if (
      v.german &&
      !mergedVocab.some(
        (ex) => ex.german.toLowerCase() === v.german.toLowerCase()
      )
    ) {
      mergedVocab.push(v);
    }
  };

  for (const v of [...(extraAi?.vocab ?? []), ...base.vocab]) {
    pushVocab(v);
  }
  if (mergedVocab.length < 3) {
    for (const v of dynamicFallback.vocab) {
      pushVocab(v);
      if (mergedVocab.length >= 3) break;
    }
  }

  return {
    structures: mergedStructures,
    vocab: mergedVocab,
  };
}

const STOPWORDS = new Set([
  "der",
  "die",
  "das",
  "den",
  "dem",
  "ein",
  "eine",
  "einen",
  "einem",
  "einer",
  "und",
  "oder",
  "für",
  "mit",
  "auf",
  "im",
  "in",
  "am",
  "an",
  "zu",
  "von",
  "aus",
  "bei",
  "sich",
  "sein",
  "haben",
  "werden",
  "nicht",
  "viel",
  "sehr",
  "gut",
]);

export function isVocabAppliedInText(
  item: LeitpunktVocabSuggestion,
  writingText: string
): boolean {
  const draftLower = writingText.toLowerCase();
  if (!draftLower.trim()) return false;

  if (item.matchTokens && item.matchTokens.length > 0) {
    return item.matchTokens.some((tok) =>
      draftLower.includes(tok.toLowerCase())
    );
  }

  const cleanWords = item.german
    .toLowerCase()
    .replace(/[.,!?;:()„“"'\[\]\/]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

  if (cleanWords.length === 0) return false;
  return cleanWords.some((w) => {
    const stem = w.length >= 6 ? w.slice(0, w.length - 2) : w;
    return draftLower.includes(stem);
  });
}

export function isStructureAppliedInText(
  item: LeitpunktStructureSuggestion,
  writingText: string
): boolean {
  const draftLower = writingText.toLowerCase();
  if (!draftLower.trim()) return false;

  const prefixWords = item.insertDe
    .toLowerCase()
    .replace(/[.,!?;:()„“"'\[\]]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);

  if (prefixWords.length >= 2) {
    const probe = prefixWords.join(" ");
    if (draftLower.includes(probe)) return true;
  }
  return false;
}
