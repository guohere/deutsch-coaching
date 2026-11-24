import { SkillDrillExercise } from "./types";

/**
 * Additional Complete Goethe-Zertifikat B1 Model Exam Sets (Modelltest 2 & Modelltest 3)
 * across Hören (Teil 1–4), Lesen (Teil 1–5), and Schreiben (Aufgabe 1–3).
 * Every task includes its official reference sourceCredit and clickable sourceUrl.
 */
export const EXTRA_MODEL_TEST_EXERCISES: SkillDrillExercise[] = [
  // =========================================================================
  // HÖREN · MODELLTEST 2 (TEIL 1, TEIL 2, TEIL 3, TEIL 4 — 30 AUFGABEN)
  // =========================================================================
  {
    id: "bank-hoeren-b1-mt2-teil1",
    skill: "hoeren",
    level: "B1",
    topicDe: "Einkaufen, Sport, Verkehr & Wetter",
    topicEn: "Store Announcements, Sports Club, Traffic & Weather",
    vocabCategoryId: "voc-leisure",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 2 — Hören Teil 1 (5 Kurztexte · Nr. 1–10)",
    examPartNumber: 1,
    modelTestNumber: 2,
    examPartLabel: "Hören · Teil 1 (Modelltest 2 · 10 Aufgaben)",
    officialFormatBadge: "5 Kurztexte · 10 Aufgaben (R/F + a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 33,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Teil 1): Sie hören fünf kurze Texte. Sie hören jeden Text zweimal (2×). Wählen Sie für die Aufgaben 1 bis 10 die richtige Lösung.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Text eins. Werte Kundinnen und Kunden im Kaufhaus Zentrum: Unser Sommerschlussverkauf geht in die letzte Runde! Heute erhalten Sie in der Sportabteilung im dritten Stock dreißig Prozent Rabatt auf alle Wanderschuhe und Regenjacken. Bitte beachten Sie außerdem, dass unsere Kassen im Erdgeschoss wegen eines Software-Updates heute geschlossen sind. Bitte bezahlen Sie Ihre Einkäufe an den Kassen im ersten oder zweiten Stock. " +
      "Text zwei. Hallo Lukas, hier ist Miriam vom Schwimmverein. Unser Training morgen Abend um neunzehn Uhr kann leider nicht im Hallenbad Süd stattfinden, weil dort das Wasserbecken gereinigt wird. Wir trainieren stattdessen zur gleichen Uhrzeit im Sportbad West. Denk bitte daran, einen Zwei-Euro-Chip für die neuen Kleiderschränke mitzunehmen! " +
      "Text drei. Und hier eine aktuelle Verkehrsmeldung für alle Autofahrer rund um Köln: Nach einem Lkw-Unfall ist die Autobahn A drei zwischen Königsforst und Heumar in Richtung Frankfurt momentan komplett gesperrt. Die Polizei leitet den Verkehr ab der Ausfahrt Dellbrück um. Wer zum Flughafen möchte, sollte das Auto am besten am Park-and-Ride-Parkplatz abstellen und die S-Bahn-Linie neunzehn nehmen. " +
      "Text vier. Guten Tag, Frau Krämer, hier spricht Meister Scholz aus der Fahrradwerkstatt. Wir haben Ihr E-Bike heute Vormittag untersucht. Die Bremsen konnten wir sofort einstellen, aber der Akku ist leider defekt und muss beim Hersteller neu bestellt werden. Das Ersatzteil kommt erst am kommenden Dienstag. Sie können Ihr Rad also am Mittwochnachmittag ab fünfzehn Uhr bei uns abholen. " +
      "Text fünf. Zum Schluss das Wetter für unser Wochenende in Bayern: Am Samstagvormittag scheint im ganzen Land noch die Sonne bei angenehmen zweiundzwanzig Grad. Ab Samstagnachmittag ziehen jedoch aus dem Westen kräftige Gewitter auf. Am Sonntag bleibt es kühl, aber trocken, sodass einer Wanderung am Sonntag nichts im Wege steht.",
    sections: [
      {
        id: "mt2-t1",
        label: "Text 1 (Zu Aufgaben 1 & 2)",
        title: "Durchsage im Kaufhaus Zentrum",
        speakerRole: "Kaufhaus-Durchsage",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Werte Kundinnen und Kunden im Kaufhaus Zentrum: Unser Sommerschlussverkauf geht in die letzte Runde! Heute erhalten Sie in der Sportabteilung im dritten Stock dreißig Prozent Rabatt auf alle Wanderschuhe und Regenjacken. Bitte beachten Sie außerdem, dass unsere Kassen im Erdgeschoss wegen eines Software-Updates heute geschlossen sind. Bitte bezahlen Sie Ihre Einkäufe an den Kassen im ersten oder zweiten Stock.",
      },
      {
        id: "mt2-t2",
        label: "Text 2 (Zu Aufgaben 3 & 4)",
        title: "Sprachnachricht vom Schwimmverein",
        speakerRole: "Miriam (Schwimmverein)",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Hallo Lukas, hier ist Miriam vom Schwimmverein. Unser Training morgen Abend um neunzehn Uhr kann leider nicht im Hallenbad Süd stattfinden, weil dort das Wasserbecken gereinigt wird. Wir trainieren stattdessen zur gleichen Uhrzeit im Sportbad West. Denk bitte daran, einen Zwei-Euro-Chip für die neuen Kleiderschränke mitzunehmen!",
      },
      {
        id: "mt2-t3",
        label: "Text 3 (Zu Aufgaben 5 & 6)",
        title: "Verkehrsmeldung im Radio (Autobahn A3)",
        speakerRole: "Radiomoderator",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Und hier eine aktuelle Verkehrsmeldung für alle Autofahrer rund um Köln: Nach einem Lkw-Unfall ist die Autobahn A drei zwischen Königsforst und Heumar in Richtung Frankfurt momentan komplett gesperrt. Die Polizei leitet den Verkehr ab der Ausfahrt Dellbrück um. Wer zum Flughafen möchte, sollte das Auto am besten am Park-and-Ride-Parkplatz abstellen und die S-Bahn-Linie neunzehn nehmen.",
      },
      {
        id: "mt2-t4",
        label: "Text 4 (Zu Aufgaben 7 & 8)",
        title: "Anruf aus der Fahrradwerkstatt",
        speakerRole: "Meister Scholz",
        edgeVoice: "de-DE-KillianNeural",
        textDe:
          "Guten Tag, Frau Krämer, hier spricht Meister Scholz aus der Fahrradwerkstatt. Wir haben Ihr E-Bike heute Vormittag untersucht. Die Bremsen konnten wir sofort einstellen, aber der Akku ist leider defekt und muss beim Hersteller neu bestellt werden. Das Ersatzteil kommt erst am kommenden Dienstag. Sie können Ihr Rad also am Mittwochnachmittag ab fünfzehn Uhr bei uns abholen.",
      },
      {
        id: "mt2-t5",
        label: "Text 5 (Zu Aufgaben 9 & 10)",
        title: "Radio-Wetterbericht für das Wochenende",
        speakerRole: "Wetterredaktion",
        edgeVoice: "de-DE-AmalaNeural",
        textDe:
          "Zum Schluss das Wetter für unser Wochenende in Bayern: Am Samstagvormittag scheint im ganzen Land noch die Sonne bei angenehmen zweiundzwanzig Grad. Ab Samstagnachmittag ziehen jedoch aus dem Westen kräftige Gewitter auf. Am Sonntag bleibt es kühl, aber trocken, sodass einer Wanderung am Sonntag nichts im Wege steht.",
      },
    ],
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        sectionLabel: "Text 1",
        questionType: "richtig_falsch",
        questionDe: "Im Kaufhaus kann man heute an den Kassen im Erdgeschoss bezahlen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „unsere Kassen im Erdgeschoss [sind] wegen eines Software-Updates heute geschlossen. Bitte bezahlen Sie Ihre Einkäufe an den Kassen im ersten oder zweiten Stock.“",
      },
      {
        id: "q2",
        itemNumber: 2,
        sectionLabel: "Text 1",
        questionType: "mcq",
        questionDe: "Worauf gibt es heute im dritten Stock 30 Prozent Rabatt?",
        options: [
          "Auf alle Wanderschuhe und Regenjacken.",
          "Auf alle Kinderfahrräder.",
          "Auf Computer und Software.",
        ],
        correctIndex: 0,
        explanation:
          "„Heute erhalten Sie in der Sportabteilung im dritten Stock dreißig Prozent Rabatt auf alle Wanderschuhe und Regenjacken.“",
      },
      {
        id: "q3",
        itemNumber: 3,
        sectionLabel: "Text 2",
        questionType: "richtig_falsch",
        questionDe: "Das Schwimmtraining fällt morgen Abend komplett aus.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Es findet zur gleichen Uhrzeit (19 Uhr) in einem anderen Schwimmbad (im Sportbad West) statt.",
      },
      {
        id: "q4",
        itemNumber: 4,
        sectionLabel: "Text 2",
        questionType: "mcq",
        questionDe: "Was soll Lukas ins Sportbad West mitbringen?",
        options: [
          "Einen neuen Mitgliedsausweis.",
          "Einen Zwei-Euro-Chip für die Kleiderschränke.",
          "Ein eigenes Vorhängeschloss.",
        ],
        correctIndex: 1,
        explanation:
          "„Denk bitte daran, einen Zwei-Euro-Chip für die neuen Kleiderschränke mitzunehmen!“",
      },
      {
        id: "q5",
        itemNumber: 5,
        sectionLabel: "Text 3",
        questionType: "richtig_falsch",
        questionDe: "Die Autobahn A3 in Richtung Frankfurt ist wegen eines Unfalls gesperrt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Nach einem Lkw-Unfall ist die Autobahn A drei ... in Richtung Frankfurt momentan komplett gesperrt.“",
      },
      {
        id: "q6",
        itemNumber: 6,
        sectionLabel: "Text 3",
        questionType: "mcq",
        questionDe: "Was wird Reisenden empfohlen, die zum Flughafen wollen?",
        options: [
          "Über die Ausfahrt Heumar weiterzufahren.",
          "Auf der Autobahn im Auto zu warten.",
          "Das Auto am Park-and-Ride-Parkplatz abzustellen und die S-Bahn-Linie 19 zu nehmen.",
        ],
        correctIndex: 2,
        explanation:
          "„Wer zum Flughafen möchte, sollte das Auto am besten am Park-and-Ride-Parkplatz abstellen und die S-Bahn-Linie neunzehn nehmen.“",
      },
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Text 4",
        questionType: "richtig_falsch",
        questionDe: "Frau Krämer kann ihr E-Bike schon heute Nachmittag wieder abholen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Der neue Akku kommt erst am Dienstag; sie kann das Rad erst am kommenden Mittwochnachmittag ab 15 Uhr abholen.",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Text 4",
        questionType: "mcq",
        questionDe: "Was muss beim Hersteller neu bestellt werden?",
        options: [
          "Die beiden Bremsen.",
          "Der defekte Akku.",
          "Ein neuer Fahrradlenker.",
        ],
        correctIndex: 1,
        explanation:
          "„Die Bremsen konnten wir sofort einstellen, aber der Akku ist leider defekt und muss beim Hersteller neu bestellt werden.“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Text 5",
        questionType: "richtig_falsch",
        questionDe: "Am Samstagnachmittag wird es in Bayern stürmisch mit Gewittern.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Ab Samstagnachmittag ziehen jedoch aus dem Westen kräftige Gewitter auf.“",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Text 5",
        questionType: "mcq",
        questionDe: "Wann eignet sich das Wetter am besten für eine Wanderung?",
        options: [
          "Am Samstagnachmittag.",
          "In der Nacht zum Sonntag.",
          "Am Sonntag, weil es dann trocken bleibt.",
        ],
        correctIndex: 2,
        explanation:
          "„Am Sonntag bleibt es kühl, aber trocken, sodass einer Wanderung am Sonntag nichts im Wege steht.“",
      },
    ],
    keyVocab: [
      { german: "der Sommerschlussverkauf", meaning: "end-of-summer clearance sale" },
      { german: "den Verkehr umleiten", meaning: "to divert traffic" },
      { german: "das Ersatzteil bestellen", meaning: "to order the spare part" },
      { german: "Gewitter ziehen auf", meaning: "thunderstorms are approaching" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt2-teil2",
    skill: "hoeren",
    level: "B1",
    topicDe: "Umwelt, Natur & Reisen",
    topicEn: "National Park Visitor Center Orientation",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-passiv",
    title: "Modelltest 2 — Hören Teil 2 (Nationalpark-Führung · Nr. 11–15)",
    examPartNumber: 2,
    modelTestNumber: 2,
    examPartLabel: "Hören · Teil 2 (Modelltest 2 · 5 Aufgaben)",
    officialFormatBadge: "1 Vortrag · 5 Aufgaben (a/b/c) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 17,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Teil 2): Sie hören eine Begrüßung im Besucherzentrum des Nationalparks Bayerischer Wald. Sie hören den Vortrag NUR EINMAL (1×)! Wählen Sie für die Aufgaben 11 bis 15 die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Grüß Gott und herzlich willkommen im Besucherzentrum des Nationalparks Bayerischer Wald! Mein Name ist Johanna Lindner, und als Rangerin freue ich mich sehr, Sie heute Morgen auf unserer dreistündigen Waldtour zu begleiten. Unser Nationalpark wurde bereits im Jahr neunzehnhundertsiebzig als allererster Nationalpark Deutschlands gegründet. Das Besondere an unserem Konzept lautet „Natur Natur sein lassen“: Wenn hier bei einem Sturm alte Bäume umfallen, werden sie nicht von Waldarbeitern weggeräumt, sondern bleiben liegen, weil das tote Holz Lebensraum für seltene Käfer und Pilze bietet. " +
      "Auf unserer heutigen Wanderung kommen wir zuerst am großen Tierfreigehege vorbei. Dort leben Luchse und Wölfe in weiten, natürlichen Waldstücken. Bitte bleiben Sie auf der Holzbrücke absolut ruhig und füttern Sie die Tiere auf keinen Fall! " +
      "Nach etwa anderthalb Stunden erreichen wir den Baumwipfelpfad. Wer schwindelfrei ist, kann dort auf vierzig Metern Höhe über den Baumkronen spazieren; für Besucher im Rollstuhl oder mit Kinderwagen gibt es am Eingang einen modernen Aufzug. " +
      "Da es heute Nacht im Wald geregnet hat, sind die schmalen Wurzelwege am Berghang leider sehr rutschig. Wir nehmen für den Rückweg deshalb nicht den steilen Felsensteig, sondern wandern auf dem breiten Forstweg am Bach entlang zurück. " +
      "Um dreizehn Uhr kehren wir in die Waldgaststätte ein. Dort ist für unsere Gruppe bereits ein Tisch reserviert, und wer möchte, kann dort frische Pilzsuppe oder regionalen Käse probieren.",
    questions: [
      {
        id: "q11",
        itemNumber: 11,
        questionType: "mcq",
        questionDe: "Was passiert im Nationalpark mit Bäumen, die bei einem Sturm umfallen?",
        options: [
          "Sie werden sofort zu Möbeln verarbeitet.",
          "Sie bleiben im Wald liegen, weil sie Lebensraum für Tiere und Pilze sind.",
          "Besucher dürfen das Holz kostenlos als Brennholz mitnehmen.",
        ],
        correctIndex: 1,
        explanation:
          "„Wenn hier bei einem Sturm alte Bäume umfallen, werden sie nicht von Waldarbeitern weggeräumt, sondern bleiben liegen, weil das tote Holz Lebensraum für seltene Käfer und Pilze bietet.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        questionType: "mcq",
        questionDe: "Worauf müssen die Besucher beim Tierfreigehege achten?",
        options: [
          "Sie sollen auf der Holzbrücke ruhig bleiben und die Tiere nicht füttern.",
          "Sie dürfen die Holzbrücke nur einzeln betreten.",
          "Sie müssen Hunde vor dem Eingang an Bäumen anbinden.",
        ],
        correctIndex: 0,
        explanation:
          "„Bitte bleiben Sie auf der Holzbrücke absolut ruhig und füttern Sie die Tiere auf keinen Fall!“",
      },
      {
        id: "q13",
        itemNumber: 13,
        questionType: "mcq",
        questionDe: "Wie kommen Besucher mit Kinderwagen auf den Baumwipfelpfad?",
        options: [
          "Gar nicht, Kinderwagen müssen unten abgegeben werden.",
          "Über eine lange Holztreppe auf der Rückseite.",
          "Mit einem modernen Aufzug direkt am Eingang.",
        ],
        correctIndex: 2,
        explanation:
          "„für Besucher im Rollstuhl oder mit Kinderwagen gibt es am Eingang einen modernen Aufzug.“",
      },
      {
        id: "q14",
        itemNumber: 14,
        questionType: "mcq",
        questionDe: "Warum ändert die Rangerin heute die Route für den Rückweg?",
        options: [
          "Weil die schmalen Wurzelwege nach dem Regen in der Nacht sehr rutschig sind.",
          "Weil auf dem Felsensteig gerade eine Brücke gebaut wird.",
          "Weil die Gruppe früher als geplant zum Bahnhof muss.",
        ],
        correctIndex: 0,
        explanation:
          "„Da es heute Nacht im Wald geregnet hat, sind die schmalen Wurzelwege am Berghang leider sehr rutschig. Wir nehmen für den Rückweg deshalb nicht den steilen Felsensteig, sondern wandern auf dem breiten Forstweg...“",
      },
      {
        id: "q15",
        itemNumber: 15,
        questionType: "mcq",
        questionDe: "Was findet um 13 Uhr am Ende der Führung statt?",
        options: [
          "Ein Filmvortrag im Kinosaal des Besucherzentrums.",
          "Eine gemeinsame Einkehr an einem reservierten Tisch in der Waldgaststätte.",
          "Eine kostenlose Busfahrt auf den höchsten Berg.",
        ],
        correctIndex: 1,
        explanation:
          "„Um dreizehn Uhr kehren wir in die Waldgaststätte ein. Dort ist für unsere Gruppe bereits ein Tisch reserviert...“",
      },
    ],
    keyVocab: [
      { german: "der Lebensraum", meaning: "habitat" },
      { german: " der Baumwipfelpfad", meaning: "treetop walkway" },
      { german: "schwindelfrei sein", meaning: "to have a head for heights / not get dizzy" },
      { german: "rutschig", meaning: "slippery" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt2-teil3",
    skill: "hoeren",
    level: "B1",
    topicDe: "Reisen, Freizeit & Urlaub",
    topicEn: "2-Speaker Train Conversation: Summer Camping at Lake Constance",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-past",
    title: "Modelltest 2 — Hören Teil 3 (Alltagsgespräch im Zug · Nr. 16–22)",
    examPartNumber: 3,
    modelTestNumber: 2,
    examPartLabel: "Hören · Teil 3 (Modelltest 2 · 7 Aufgaben · R/F)",
    officialFormatBadge: "2 Sprecher · 7 Aufgaben (Richtig/Falsch) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Teil 3): Sie hören im Regionalzug ein Gespräch zwischen zwei Bekannten (Maja und Felix). Sie hören das Gespräch NUR EINMAL (1×)! Entscheiden Sie bei den Aufgaben 16 bis 22, ob die Aussagen Richtig oder Falsch sind.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Maja: Hallo Felix! Was für eine Überraschung, dich hier im Zug zu treffen! Fährst du auch schon in den Sommerurlaub? " +
      "Felix: Hi Maja! Nein, leider noch nicht. Ich fahre heute nur übers Wochenende zu meiner Schwester nach Augsburg, weil ihre Tochter am Sonntag Geburtstag feiert. Mein richtiger Jahresurlaub beginnt erst im August. Und du hast ja einen riesigen Rucksack dabei! " +
      "Maja: Ja, mein Freund und ich fahren für zehn Tage an den Bodensee zum Zelten. Eigentlich wollten wir dieses Jahr nach Italien fliegen, aber die Flugtickets waren im Juli viel zu teuer. " +
      "Felix: Zelten am Bodensee ist doch herrlich! Habt ihr euch denn ein eigenes Zelt gekauft? " +
      "Maja: Nein, für eine einzige Reise wollten wir kein neues Zelt kaufen. Mein Arbeitskollege Stefan hat uns sein großes Vier-Personen-Zelt und zwei Campingstühle kostenlos geliehen. " +
      "Felix: Das ist praktisch. Und wo genau übernachtet ihr dort? Direkt in Konstanz? " +
      "Maja: In Konstanz waren leider schon alle Plätze ausgebucht. Aber wir haben einen kleineren Campingplatz direkt am Ufer in der Nähe von Lindau gefunden. Dort kann man morgens gleich vor dem Frühstück im See schwimmen gehen. " +
      "Felix: Traumhaft! Nehmt ihr eure Fahrräder im Zug mit? " +
      "Maja: Im ICE war leider kein Fahrradstellplatz mehr frei. Deshalb mieten wir uns vor Ort für eine Woche zwei Tourenräder, um einmal komplett um den See zu radeln.",
    sections: [
      {
        id: "mt2-d1",
        label: "Maja",
        speakerRole: "Maja",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Hallo Felix! Was für eine Überraschung, dich hier im Zug zu treffen! Fährst du auch schon in den Sommerurlaub?",
      },
      {
        id: "mt2-d2",
        label: "Felix",
        speakerRole: "Felix",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Hi Maja! Nein, leider noch nicht. Ich fahre heute nur übers Wochenende zu meiner Schwester nach Augsburg, weil ihre Tochter am Sonntag Geburtstag feiert. Mein richtiger Jahresurlaub beginnt erst im August. Und du hast ja einen riesigen Rucksack dabei!",
      },
      {
        id: "mt2-d3",
        label: "Maja",
        speakerRole: "Maja",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Ja, mein Freund und ich fahren für zehn Tage an den Bodensee zum Zelten. Eigentlich wollten wir dieses Jahr nach Italien fliegen, aber die Flugtickets waren im Juli viel zu teuer.",
      },
      {
        id: "mt2-d4",
        label: "Felix",
        speakerRole: "Felix",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Zelten am Bodensee ist doch herrlich! Habt ihr euch denn ein eigenes Zelt gekauft?",
      },
      {
        id: "mt2-d5",
        label: "Maja",
        speakerRole: "Maja",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Nein, für eine einzige Reise wollten wir kein neues Zelt kaufen. Mein Arbeitskollege Stefan hat uns sein großes Vier-Personen-Zelt und zwei Campingstühle kostenlos geliehen.",
      },
      {
        id: "mt2-d6",
        label: "Felix",
        speakerRole: "Felix",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Das ist praktisch. Und wo genau übernachtet ihr dort? Direkt in Konstanz?",
      },
      {
        id: "mt2-d7",
        label: "Maja",
        speakerRole: "Maja",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "In Konstanz waren leider schon alle Plätze ausgebucht. Aber wir haben einen kleineren Campingplatz direkt am Ufer in der Nähe von Lindau gefunden. Dort kann man morgens gleich vor dem Frühstück im See schwimmen gehen.",
      },
      {
        id: "mt2-d8",
        label: "Felix",
        speakerRole: "Felix",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Traumhaft! Nehmt ihr eure Fahrräder im Zug mit?",
      },
      {
        id: "mt2-d9",
        label: "Maja",
        speakerRole: "Maja",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Im ICE war leider kein Fahrradstellplatz mehr frei. Deshalb mieten wir uns vor Ort für eine Woche zwei Tourenräder, um einmal komplett um den See zu radeln.",
      },
    ],
    questions: [
      {
        id: "q16",
        itemNumber: 16,
        questionType: "richtig_falsch",
        questionDe: "Felix hat jetzt im Juli schon seinen langen Jahresurlaub.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Felix fährt nur übers Wochenende zu seiner Schwester nach Augsburg; sein Jahresurlaub beginnt erst im August.",
      },
      {
        id: "q17",
        itemNumber: 17,
        questionType: "richtig_falsch",
        questionDe: "Felix besucht am Wochenende den Geburtstag seiner Nichte in Augsburg.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Er fährt zu seiner Schwester nach Augsburg, „weil ihre Tochter am Sonntag Geburtstag feiert“.",
      },
      {
        id: "q18",
        itemNumber: 18,
        questionType: "richtig_falsch",
        questionDe: "Maja und ihr Freund fliegen nicht nach Italien, weil die Flüge zu teuer waren.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Eigentlich wollten wir dieses Jahr nach Italien fliegen, aber die Flugtickets waren im Juli viel zu teuer.“",
      },
      {
        id: "q19",
        itemNumber: 19,
        questionType: "richtig_falsch",
        questionDe: "Maja hat im Sportgeschäft ein neues Vier-Personen-Zelt gekauft.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Ihr Arbeitskollege Stefan hat ihnen sein Zelt und zwei Campingstühle kostenlos geliehen.",
      },
      {
        id: "q20",
        itemNumber: 20,
        questionType: "richtig_falsch",
        questionDe: "In Konstanz gab es auf den Campingplätzen keine freien Plätze mehr.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „In Konstanz waren leider schon alle Plätze ausgebucht.“",
      },
      {
        id: "q21",
        itemNumber: 21,
        questionType: "richtig_falsch",
        questionDe: "Der gebuchte Campingplatz bei Lindau liegt weit weg vom Wasser.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Der Campingplatz liegt „direkt am Ufer“, sodass man morgens gleich im See schwimmen kann.",
      },
      {
        id: "q22",
        itemNumber: 22,
        questionType: "richtig_falsch",
        questionDe: "Maja und ihr Freund leihen sich die Fahrräder erst direkt am Bodensee.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Im ICE war kein Fahrradstellplatz mehr frei, „deshalb mieten wir uns vor Ort für eine Woche zwei Tourenräder“.",
      },
    ],
    keyVocab: [
      { german: "ausgebucht sein", meaning: "to be fully booked" },
      { german: "jemandem etwas leihen", meaning: "to lend something to someone" },
      { german: "das Ufer", meaning: "shore / lakeside" },
      { german: "vor Ort mieten", meaning: "to rent on site / locally" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt2-teil4",
    skill: "hoeren",
    level: "B1",
    topicDe: "Reisen, Verkehr & Gesellschaft",
    topicEn: "3-Speaker Radio Debate: Free Public Transport in Cities?",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-konjunktiv2",
    title: "Modelltest 2 — Hören Teil 4 (Radiodiskussion: Kostenloser Nahverkehr · Nr. 23–30)",
    examPartNumber: 4,
    modelTestNumber: 2,
    examPartLabel: "Hören · Teil 4 (Modelltest 2 · 8 Aufgaben · Wer sagt was?)",
    officialFormatBadge: "3 Sprecher · 8 Aufgaben (Wer sagt was? a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 27,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Teil 4): Sie hören eine Radiodiskussion zum Thema „Sollten Busse und Bahnen in der Stadt für alle kostenlos sein?“. Die Moderatorin diskutiert mit dem Verkehrsplaner Dr. Thomas Stein und der Stadträtin Eva Keller. Sie hören die Diskussion zweimal (2×). Ordnen Sie die Aussagen 23 bis 30 der richtigen Person zu (a, b oder c).",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Moderatorin: Guten Abend bei unserem Bürgerforum im Radio! In einigen europäischen Städten wie Luxemburg können Bürgerinnen und Bürger Busse und Straßenbahnen bereits völlig kostenlos benutzen. Sollten auch deutsche Großstädte die Fahrscheine komplett abschaffen? Darüber spreche ich heute mit dem Verkehrsplaner Doktor Thomas Stein und der Stadträtin Eva Keller. Frau Keller, warum fordern Sie kostenlose Busse und Bahnen? " +
      "Eva Keller: Guten Abend! Unsere Innenstädte ersticken jeden Morgen im Stau, und die Feinstaubwerte sind viel zu hoch. Wenn niemand mehr ein teures Ticket kaufen muss, wird der Umstieg vom Auto auf die Straßenbahn viel einfacher, und gleichzeitig entlasten wir Familien mit geringem Einkommen. " +
      "Dr. Thomas Stein: Als Verkehrsplaner wünsche ich mir natürlich auch weniger Autos, Frau Keller. Aber Studien aus Städten mit Gratis-Nahverkehr zeigen ein überraschendes Ergebnis: Die meisten Autofahrer steigen gar nicht wegen des Ticketpreises um, sondern nur dann, wenn die Bahnen pünktlich sind und alle zehn Minuten fahren. " +
      "Moderatorin: Vor der Sendung haben uns auch viele Pendler vom Land geschrieben, dass in ihren Dörfern abends nach zwanzig Uhr überhaupt kein Bus mehr fährt – egal ob kostenlos oder nicht. " +
      "Dr. Thomas Stein: Genau das ist das Problem! Wenn wir die Einnahmen aus den Ticketverkäufen komplett streichen, fehlt den Verkehrsbetrieben jedes Jahr ein Milliardenbetrag. Dieses Geld brauchen wir dringend, um neue Buslinien auf dem Land einzurichten und kaputte Schienen zu reparieren. " +
      "Eva Keller: Das Geld ließe sich doch problemlos an anderer Stelle einnehmen, Herr Stein! Wenn wir die Parkgebühren für Autos im Stadtzentrum verdoppeln und eine City-Maut einführen, können wir den kostenlosen Nahverkehr finanzieren, ohne beim Ausbau zu sparen. " +
      "Dr. Thomas Stein: Außerdem hat der Gratis-Verkehr noch einen Nebeneffekt: In Teststädten nutzten plötzlich auch Fußgänger und Radfahrer für ganz kurze Strecken von zwei Haltestellen den Bus, sodass die Busse im Berufsverkehr völlig überfüllt waren. Ein günstiges Monatsticket für dreißig Euro ist deshalb viel sinnvoller als null Euro. " +
      "Moderatorin: Ein spannender Streit um den besten Weg zur Verkehrswende! Nächste Woche sprechen wir an dieser Stelle über sichere Schulwege für Kinder. Vielen Dank an meine Gäste!",
    sections: [
      {
        id: "mt2-r1",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Guten Abend bei unserem Bürgerforum im Radio! In einigen europäischen Städten wie Luxemburg können Bürgerinnen und Bürger Busse und Straßenbahnen bereits völlig kostenlos benutzen. Sollten auch deutsche Großstädte die Fahrscheine komplett abschaffen? Darüber spreche ich heute mit dem Verkehrsplaner Doktor Thomas Stein und der Stadträtin Eva Keller. Frau Keller, warum fordern Sie kostenlose Busse und Bahnen?",
      },
      {
        id: "mt2-r2",
        label: "c) Eva Keller (Stadträtin)",
        speakerRole: "Eva Keller",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Guten Abend! Unsere Innenstädte ersticken jeden Morgen im Stau, und die Feinstaubwerte sind viel zu hoch. Wenn niemand mehr ein teures Ticket kaufen muss, wird der Umstieg vom Auto auf die Straßenbahn viel einfacher, und gleichzeitig entlasten wir Familien mit geringem Einkommen.",
      },
      {
        id: "mt2-r3",
        label: "b) Dr. Thomas Stein (Verkehrsplaner)",
        speakerRole: "Dr. Thomas Stein",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Als Verkehrsplaner wünsche ich mir natürlich auch weniger Autos, Frau Keller. Aber Studien aus Städten mit Gratis-Nahverkehr zeigen ein überraschendes Ergebnis: Die meisten Autofahrer steigen gar nicht wegen des Ticketpreises um, sondern nur dann, wenn die Bahnen pünktlich sind und alle zehn Minuten fahren.",
      },
      {
        id: "mt2-r4",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Vor der Sendung haben uns auch viele Pendler vom Land geschrieben, dass in ihren Dörfern abends nach zwanzig Uhr überhaupt kein Bus mehr fährt – egal ob kostenlos oder nicht.",
      },
      {
        id: "mt2-r5",
        label: "b) Dr. Thomas Stein (Verkehrsplaner)",
        speakerRole: "Dr. Thomas Stein",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Genau das ist das Problem! Wenn wir die Einnahmen aus den Ticketverkäufen komplett streichen, fehlt den Verkehrsbetrieben jedes Jahr ein Milliardenbetrag. Dieses Geld brauchen wir dringend, um neue Buslinien auf dem Land einzurichten und kaputte Schienen zu reparieren.",
      },
      {
        id: "mt2-r6",
        label: "c) Eva Keller (Stadträtin)",
        speakerRole: "Eva Keller",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Das Geld ließe sich doch problemlos an anderer Stelle einnehmen, Herr Stein! Wenn wir die Parkgebühren für Autos im Stadtzentrum verdoppeln und eine City-Maut einführen, können wir den kostenlosen Nahverkehr finanzieren, ohne beim Ausbau zu sparen.",
      },
      {
        id: "mt2-r7",
        label: "b) Dr. Thomas Stein (Verkehrsplaner)",
        speakerRole: "Dr. Thomas Stein",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Außerdem hat der Gratis-Verkehr noch einen Nebeneffekt: In Teststädten nutzten plötzlich auch Fußgänger und Radfahrer für ganz kurze Strecken von zwei Haltestellen den Bus, sodass die Busse im Berufsverkehr völlig überfüllt waren. Ein günstiges Monatsticket für dreißig Euro ist deshalb viel sinnvoller als null Euro.",
      },
      {
        id: "mt2-r8",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Ein spannender Streit um den besten Weg zur Verkehrswende! Nächste Woche sprechen wir an dieser Stelle über sichere Schulwege für Kinder. Vielen Dank an meine Gäste!",
      },
    ],
    questions: [
      {
        id: "q23",
        itemNumber: 23,
        questionType: "speaker_match",
        questionDe: "In Luxemburg ist die Fahrt mit Bussen und Bahnen bereits kostenlos.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin erwähnt in der Einleitung Luxemburg als Beispiel für kostenlosen Nahverkehr.",
      },
      {
        id: "q24",
        itemNumber: 24,
        questionType: "speaker_match",
        questionDe: "Ein kostenloser Nahverkehr hilft besonders Familien, die wenig Geld verdienen.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 2,
        explanation:
          "Eva Keller sagt: „und gleichzeitig entlasten wir Familien mit geringem Einkommen.“",
      },
      {
        id: "q25",
        itemNumber: 25,
        questionType: "speaker_match",
        questionDe: "Autofahrer wechseln nur dann zur Bahn, wenn die Züge zuverlässig und häufig fahren.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 1,
        explanation:
          "Dr. Thomas Stein erklärt: „Die meisten Autofahrer steigen gar nicht wegen des Ticketpreises um, sondern nur dann, wenn die Bahnen pünktlich sind und alle zehn Minuten fahren.“",
      },
      {
        id: "q26",
        itemNumber: 26,
        questionType: "speaker_match",
        questionDe: "In vielen Dörfern gibt es am Abend nach 20 Uhr gar keine Busverbindung mehr.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin berichtet von Zuschriften der Pendler vom Land über fehlende Busse nach 20 Uhr.",
      },
      {
        id: "q27",
        itemNumber: 27,
        questionType: "speaker_match",
        questionDe: "Ohne Ticketverkäufe fehlt das Geld für neue Buslinien und die Reparatur von Schienen.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 1,
        explanation:
          "Dr. Thomas Stein betont, dass die Ticketeinnahmen für neue Linien auf dem Land und Schienenreparaturen gebraucht werden.",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "speaker_match",
        questionDe: "Höhere Parkgebühren in der Innenstadt könnten den kostenlosen Nahverkehr finanzieren.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 2,
        explanation:
          "Eva Keller schlägt vor, die Parkgebühren im Zentrum zu verdoppeln und eine City-Maut einzuführen.",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "speaker_match",
        questionDe: "Bei kostenlosen Bussen fahren auch Fußgänger und Radfahrer kurze Strecken mit dem Bus.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 1,
        explanation:
          "Dr. Thomas Stein nennt diesen Nebeneffekt aus Teststädten und empfiehlt stattdessen ein 30-Euro-Monatsticket.",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "speaker_match",
        questionDe: "In der Sendung nächste Woche geht es um die Sicherheit auf dem Schulweg.",
        options: [
          "a) Die Moderatorin",
          "b) Dr. Thomas Stein (Verkehrsplaner)",
          "c) Eva Keller (Stadträtin)",
        ],
        correctIndex: 0,
        explanation:
          "Am Ende kündigt die Moderatorin das Thema für nächste Woche an („sichere Schulwege für Kinder“).",
      },
    ],
    keyVocab: [
      { german: "der öffentliche Nahverkehr", meaning: "public local transport" },
      { german: "entlasten", meaning: "to relieve / ease the burden on" },
      { german: "der Pendler", meaning: "commuter" },
      { german: "die Parkgebühren verdoppeln", meaning: "to double parking fees" },
    ],
  },

  // =========================================================================
  // HÖREN · MODELLTEST 3 (TEIL 1, TEIL 2, TEIL 3, TEIL 4 — 30 AUFGABEN)
  // =========================================================================
  {
    id: "bank-hoeren-b1-mt3-teil1",
    skill: "hoeren",
    level: "B1",
    topicDe: "Bibliothek, Flughafen, Wohnung & Kultur",
    topicEn: "Library, Airport Gate, Apartment Viewing & Open-Air Cinema",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Hören Teil 1 (5 Kurztexte · Nr. 1–10)",
    examPartNumber: 1,
    modelTestNumber: 3,
    examPartLabel: "Hören · Teil 1 (Modelltest 3 · 10 Aufgaben)",
    officialFormatBadge: "5 Kurztexte · 10 Aufgaben (R/F + a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 33,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Teil 1): Sie hören fünf kurze Texte. Sie hören jeden Text zweimal (2×). Wählen Sie für die Aufgaben 1 bis 10 die richtige Lösung.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Text eins. Hallo Frau Doktor Peters, hier ist die Stadtbibliothek Mitte. Das Fachbuch zur deutschen Architekturgeschichte, das Sie letzte Woche bei uns vorbestellt haben, ist heute zurückgegeben worden. Es liegt ab sofort für sieben Tage an der Information im Erdgeschoss für Sie bereit. Bitte denken Sie daran, dass unsere Bibliothek am morgigen Freitag wegen einer Personalversammlung bereits um fünfzehn Uhr schließt. " +
      "Text zwei. Achtung am Flughafen Frankfurt, eine wichtige Durchsage für die Passagiere des Lufthansa-Fluges LH vierhundertzwölf nach Wien, planmäßiger Abflug um sechzehn Uhr fünfundvierzig: Das Einsteigen erfolgt heute nicht am Flugsteig B vierzehn, sondern am Flugsteig A zweiundzwanzig. Die Abflugzeit bleibt unverändert. " +
      "Text drei. Hi Daniel, hier ist Carla! Ich bin gerade auf dem Weg zu unserer gemeinsamen Wohnungsbesichtigung in der Mozartstraße. Leider steckt meine Straßenbahn wegen einer Demonstration im Zentrum fest, deshalb komme ich etwa fünfzehn Minuten später. Kannst du schon mal pünktlich um achtzehn Uhr mit dem Makler hochgehen und ein paar Fotos vom Badezimmer und der Küche machen? Bis gleich! " +
      "Text vier. Und hier unser Kulturtipp für den Freitagabend: Im Schlosspark startet morgen um einundzwanzig Uhr dreißig wieder das beliebte Sommer-Open-Air-Kino mit einer französischen Komödie. Tickets für neun Euro gibt es nur noch an der Abendkasse, da der Online-Verkauf bereits beendet ist. Eigene Decken und Picknickkörbe dürfen gern mitgebracht werden. " +
      "Text fünf. Guten Tag, Herr Baumann, hier spricht Sabine Wolf von Ihrer Krankenkasse. Wir haben Ihren Antrag auf Erstattung des Rückenkurses erhalten. Damit wir Ihnen die achtzig Euro überweisen können, fehlt uns leider noch die unterschriebene Teilnahmebescheinigung der Kursleiterin. Sie können das Dokument einfach fotografieren und über unsere Smartphone-App hochladen.",
    sections: [
      {
        id: "mt3-t1",
        label: "Text 1 (Zu Aufgaben 1 & 2)",
        title: "Telefonnachricht der Stadtbibliothek Mitte",
        speakerRole: "Stadtbibliothek",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Hallo Frau Doktor Peters, hier ist die Stadtbibliothek Mitte. Das Fachbuch zur deutschen Architekturgeschichte, das Sie letzte Woche bei uns vorbestellt haben, ist heute zurückgegeben worden. Es liegt ab sofort für sieben Tage an der Information im Erdgeschoss für Sie bereit. Bitte denken Sie daran, dass unsere Bibliothek am morgigen Freitag wegen einer Personalversammlung bereits um fünfzehn Uhr schließt.",
      },
      {
        id: "mt3-t2",
        label: "Text 2 (Zu Aufgaben 3 & 4)",
        title: "Flughafendurchsage (Flug LH 412 nach Wien)",
        speakerRole: "Flughafen Frankfurt",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Achtung am Flughafen Frankfurt, eine wichtige Durchsage für die Passagiere des Lufthansa-Fluges LH vierhundertzwölf nach Wien, planmäßiger Abflug um sechzehn Uhr fünfundvierzig: Das Einsteigen erfolgt heute nicht am Flugsteig B vierzehn, sondern am Flugsteig A zweiundzwanzig. Die Abflugzeit bleibt unverändert.",
      },
      {
        id: "mt3-t3",
        label: "Text 3 (Zu Aufgaben 5 & 6)",
        title: "Sprachnachricht von Carla zur Wohnungsbesichtigung",
        speakerRole: "Carla",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Hi Daniel, hier ist Carla! Ich bin gerade auf dem Weg zu unserer gemeinsamen Wohnungsbesichtigung in der Mozartstraße. Leider steckt meine Straßenbahn wegen einer Demonstration im Zentrum fest, deshalb komme ich etwa fünfzehn Minuten später. Kannst du schon mal pünktlich um achtzehn Uhr mit dem Makler hochgehen und ein paar Fotos vom Badezimmer und der Küche machen? Bis gleich!",
      },
      {
        id: "mt3-t4",
        label: "Text 4 (Zu Aufgaben 7 & 8)",
        title: "Radiotipp: Sommer-Open-Air-Kino im Schlosspark",
        speakerRole: "Kulturradio",
        edgeVoice: "de-DE-KillianNeural",
        textDe:
          "Und hier unser Kulturtipp für den Freitagabend: Im Schlosspark startet morgen um einundzwanzig Uhr dreißig wieder das beliebte Sommer-Open-Air-Kino mit einer französischen Komödie. Tickets für neun Euro gibt es nur noch an der Abendkasse, da der Online-Verkauf bereits beendet ist. Eigene Decken und Picknickkörbe dürfen gern mitgebracht werden.",
      },
      {
        id: "mt3-t5",
        label: "Text 5 (Zu Aufgaben 9 & 10)",
        title: "Nachricht von der Krankenkasse",
        speakerRole: "Krankenkasse (Sabine Wolf)",
        edgeVoice: "de-DE-AmalaNeural",
        textDe:
          "Guten Tag, Herr Baumann, hier spricht Sabine Wolf von Ihrer Krankenkasse. Wir haben Ihren Antrag auf Erstattung des Rückenkurses erhalten. Damit wir Ihnen die achtzig Euro überweisen können, fehlt uns leider noch die unterschriebene Teilnahmebescheinigung der Kursleiterin. Sie können das Dokument einfach fotografieren und über unsere Smartphone-App hochladen.",
      },
    ],
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        sectionLabel: "Text 1",
        questionType: "richtig_falsch",
        questionDe: "Das vorbestellte Buch kann ab sofort in der Bibliothek abgeholt werden.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Es liegt ab sofort für sieben Tage an der Information im Erdgeschoss für Sie bereit.“",
      },
      {
        id: "q2",
        itemNumber: 2,
        sectionLabel: "Text 1",
        questionType: "mcq",
        questionDe: "Was ist am morgigen Freitag in der Stadtbibliothek anders als sonst?",
        options: [
          "Die Bibliothek bleibt den ganzen Tag geschlossen.",
          "Sie schließt wegen einer Personalversammlung schon um 15 Uhr.",
          "Die Information befindet sich morgen im dritten Stock.",
        ],
        correctIndex: 1,
        explanation:
          "„dass unsere Bibliothek am morgigen Freitag wegen einer Personalversammlung bereits um fünfzehn Uhr schließt.“",
      },
      {
        id: "q3",
        itemNumber: 3,
        sectionLabel: "Text 2",
        questionType: "richtig_falsch",
        questionDe: "Der Flug LH 412 nach Wien startet heute später als geplant.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Die Abflugzeit bleibt unverändert“ (nur der Flugsteig ändert sich auf A22).",
      },
      {
        id: "q4",
        itemNumber: 4,
        sectionLabel: "Text 2",
        questionType: "mcq",
        questionDe: "Wo sollen die Passagiere nach Wien heute einsteigen?",
        options: [
          "Am Flugsteig B 14.",
          "Am Flugsteig A 22.",
          "Am Schalter im Untergeschoss.",
        ],
        correctIndex: 1,
        explanation:
          "„Das Einsteigen erfolgt heute nicht am Flugsteig B vierzehn, sondern am Flugsteig A zweiundzwanzig.“",
      },
      {
        id: "q5",
        itemNumber: 5,
        sectionLabel: "Text 3",
        questionType: "richtig_falsch",
        questionDe: "Carla kommt wegen einer Demonstration etwa 15 Minuten später zur Besichtigung.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Leider steckt meine Straßenbahn wegen einer Demonstration im Zentrum fest, deshalb komme ich etwa fünfzehn Minuten später.“",
      },
      {
        id: "q6",
        itemNumber: 6,
        sectionLabel: "Text 3",
        questionType: "mcq",
        questionDe: "Worum bittet Carla ihren Freund Daniel?",
        options: [
          "Den Termin mit dem Makler auf morgen zu verschieben.",
          "Sie mit dem Auto an der Haltestelle abzuholen.",
          "Schon um 18 Uhr mit dem Makler hochzugehen und Fotos von Bad und Küche zu machen.",
        ],
        correctIndex: 2,
        explanation:
          "„Kannst du schon mal pünktlich um achtzehn Uhr mit dem Makler hochgehen und ein paar Fotos vom Badezimmer und der Küche machen?“",
      },
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Text 4",
        questionType: "richtig_falsch",
        questionDe: "Man kann für das Open-Air-Kino noch Tickets im Internet kaufen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Tickets für neun Euro gibt es nur noch an der Abendkasse, da der Online-Verkauf bereits beendet ist.“",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Text 4",
        questionType: "mcq",
        questionDe: "Was dürfen Besucher in den Schlosspark mitbringen?",
        options: [
          "Eigene Decken und Picknickkörbe.",
          "Große Grillgeräte.",
          "Freunde ohne Eintrittskarte.",
        ],
        correctIndex: 0,
        explanation:
          "„Eigene Decken und Picknickkörbe dürfen gern mitgebracht werden.“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Text 5",
        questionType: "richtig_falsch",
        questionDe: "Die Krankenkasse hat Herrn Baumann die 80 Euro bereits überwiesen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Für die Überweisung fehlt noch die unterschriebene Teilnahmebescheinigung der Kursleiterin.",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Text 5",
        questionType: "mcq",
        questionDe: "Wie kann Herr Baumann die fehlende Bescheinigung einreichen?",
        options: [
          "Nur persönlich in der Filiale.",
          "Fotografieren und über die Smartphone-App hochladen.",
          "Durch die Kursleiterin per Fax schicken lassen.",
        ],
        correctIndex: 1,
        explanation:
          "„Sie können das Dokument einfach fotografieren und über unsere Smartphone-App hochladen.“",
      },
    ],
    keyVocab: [
      { german: "der Flugsteig", meaning: "boarding gate" },
      { german: "feststecken", meaning: "to be stuck (in traffic)" },
      { german: "die Abendkasse", meaning: "box office / ticket desk at the door" },
      { german: "die Teilnahmebescheinigung", meaning: "certificate of participation" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt3-teil2",
    skill: "hoeren",
    level: "B1",
    topicDe: "Kultur, Ernährung & Handwerk",
    topicEn: "Guided Tour of a Historic Chocolate Factory",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-passiv",
    title: "Modelltest 3 — Hören Teil 2 (Führung Schokoladenmanufaktur · Nr. 11–15)",
    examPartNumber: 2,
    modelTestNumber: 3,
    examPartLabel: "Hören · Teil 2 (Modelltest 3 · 5 Aufgaben)",
    officialFormatBadge: "1 Vortrag · 5 Aufgaben (a/b/c) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 17,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Teil 2): Sie hören eine Führung durch eine historische Schokoladenmanufaktur in Bremen. Sie hören den Vortrag NUR EINMAL (1×)! Wählen Sie für die Aufgaben 11 bis 15 die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Herzlich willkommen, liebe Gäste, in unserer Bremer Schokoladenmanufaktur „HanseKakao“! Mein Name ist Sebastian Lenz, und ich führe Sie heute durch unsere gläserne Produktion. Unser Familienbetrieb wurde vor über hundertzwanzig Jahren gegründet, allerdings stellte mein Urgroßvater damals noch gar keine Schokolade her, sondern importierte zunächst ausschließlich Kaffee und Tee aus Übersee. Erst zwanzig Jahre später begann die Familie mit der eigenen Röstung von Kakaobohnen. " +
      "Bevor wir gleich durch die Glastür in die Rösthalle gehen, bitte ich Sie alle, die weißen Schutzhauben für die Haare aufzusetzen und Uhren sowie Ringe abzulegen, denn in unseren Produktionsräumen gelten strenge Hygienevorschriften. " +
      "Im ersten Raum sehen Sie unsere historischen Röstmaschinen. Während große Fabriken Kakaobohnen oft nur wenige Minuten bei sehr hoher Hitze rösten, lassen wir unsere Bohnen bei niedriger Temperatur fast vierzig Minuten lang schonend rösten, damit die feinen Fruchtaromen erhalten bleiben. " +
      "Anschließend besuchen wir im Obergeschoss unsere Lehrküche. Dort dürfen Sie nicht nur am Schokoladenbrunnen probieren, sondern unter Anleitung unserer Konditorin auch eine eigene Tafel Schokolade mit Nüssen oder getrockneten Beeren verzieren. " +
      "Da die frisch gegossene Schokolade mindestens fünfundzwanzig Minuten im Kühlschrank fest werden muss, holen Sie Ihre fertige Tafel bitte erst ganz am Ende nach unserem Besuch im kleinen Kakaomuseum am Ausgang ab.",
    questions: [
      {
        id: "q11",
        itemNumber: 11,
        questionType: "mcq",
        questionDe: "Womit handelte der Urgroßvater bei der Firmengründung zuerst?",
        options: [
          "Mit selbst gemachter Schokolade und Pralinen.",
          "Ausschließlich mit Kaffee und Tee aus Übersee.",
          "Mit historischen Röstmaschinen.",
        ],
        correctIndex: 1,
        explanation:
          "„allerdings stellte mein Urgroßvater damals noch gar keine Schokolade her, sondern importierte zunächst ausschließlich Kaffee und Tee aus Übersee.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        questionType: "mcq",
        questionDe: "Was müssen die Besucher tun, bevor sie die Rösthalle betreten?",
        options: [
          "Schutzhauben aufsetzen sowie Uhren und Ringe ablegen.",
          "Ihre Schuhe gegen Gummistiefel tauschen.",
          "Alle Taschen im Bus einschließen.",
        ],
        correctIndex: 0,
        explanation:
          "„bitte ich Sie alle, die weißen Schutzhauben für die Haare aufzusetzen und Uhren sowie Ringe abzulegen...“",
      },
      {
        id: "q13",
        itemNumber: 13,
        questionType: "mcq",
        questionDe: "Warum röstet die Manufaktur die Kakaobohnen fast 40 Minuten lang bei niedriger Temperatur?",
        options: [
          "Weil die alten Maschinen nicht heißer werden können.",
          "Um Stromkosten in der Produktion zu sparen.",
          "Damit die feinen Fruchtaromen erhalten bleiben.",
        ],
        correctIndex: 2,
        explanation:
          "„lassen wir unsere Bohnen bei niedriger Temperatur fast vierzig Minuten lang schonend rösten, damit die feinen Fruchtaromen erhalten bleiben.“",
      },
      {
        id: "q14",
        itemNumber: 14,
        questionType: "mcq",
        questionDe: "Was können die Gäste in der Lehrküche im Obergeschoss selbst machen?",
        options: [
          "Kakaobohnen mit der Hand mahlen.",
          "Eine eigene Tafel Schokolade mit Nüssen oder Beeren verzieren.",
          "Einen Kuchen für das Museumscafé backen.",
        ],
        correctIndex: 1,
        explanation:
          "„sondern unter Anleitung unserer Konditorin auch eine eigene Tafel Schokolade mit Nüssen oder getrockneten Beeren verzieren.“",
      },
      {
        id: "q15",
        itemNumber: 15,
        questionType: "mcq",
        questionDe: "Wann bekommen die Besucher ihre selbst gemachte Schokoladentafel?",
        options: [
          "Sofort in der Lehrküche.",
          "Am nächsten Tag per Post.",
          "Am Ende nach dem Museumsbesuch am Ausgang, weil sie erst 25 Minuten kühlen muss.",
        ],
        correctIndex: 2,
        explanation:
          "„Da die frisch gegossene Schokolade mindestens fünfundzwanzig Minuten im Kühlschrank fest werden muss, holen Sie Ihre fertige Tafel bitte erst ganz am Ende nach unserem Besuch im kleinen Kakaomuseum am Ausgang ab.“",
      },
    ],
    keyVocab: [
      { german: "die Hygienevorschriften", meaning: "hygiene regulations" },
      { german: "schonend rösten", meaning: "to roast gently" },
      { german: "unter Anleitung", meaning: "under guidance / instruction" },
      { german: "verzieren", meaning: "to decorate / garnish" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt3-teil3",
    skill: "hoeren",
    level: "B1",
    topicDe: "Arbeit, Gesundheit & Freizeit",
    topicEn: "2-Speaker Lunch Break Conversation: Company Sports & Cooking Class",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Hören Teil 3 (Alltagsgespräch in der Kantine · Nr. 16–22)",
    examPartNumber: 3,
    modelTestNumber: 3,
    examPartLabel: "Hören · Teil 3 (Modelltest 3 · 7 Aufgaben · R/F)",
    officialFormatBadge: "2 Sprecher · 7 Aufgaben (Richtig/Falsch) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Teil 3): Sie hören in der Kantine ein Gespräch zwischen zwei Kollegen (Miriam und Paul). Sie hören das Gespräch NUR EINMAL (1×)! Entscheiden Sie bei den Aufgaben 16 bis 22, ob die Aussagen Richtig oder Falsch sind.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Miriam: Hallo Paul, ist an deinem Tisch noch ein Platz frei? Oh, du isst heute gar nicht das Tagesgericht aus der Kantine, sondern hast dir selbst etwas von zu Hause mitgebracht! " +
      "Paul: Hi Miriam, setz dich gern! Ja, das ist ein indisches Linsengericht, das wir gestern Abend in meinem neuen Kochkurs an der Volkshochschule gekocht haben. Es war noch so viel übrig, dass es heute perfekt fürs Mittagessen gereicht hat. " +
      "Miriam: Das riecht fantastisch! Ich wusste gar nicht, dass du einen Kochkurs machst. Ich dachte, du spielst jeden Mittwochabend Badminton in unserer Betriebssportgruppe. " +
      "Paul: Das habe ich bis vor einem Monat auch gemacht. Aber leider habe ich mir beim Joggen im Park das Knie verletzt, und mein Arzt hat mir geraten, für sechs Wochen auf schnelle Ballsportarten zu verzichten. " +
      "Miriam: Oh, gute Besserung! Und wie gefällt dir der Kochkurs? Sind dort viele Teilnehmer? " +
      "Paul: Wir sind nur acht Personen in einer supermodernen Schulküche. Unser Kursleiter kommt aus Indien und zeigt uns, wie man mit frischen Gewürzen in weniger als dreißig Minuten gesunde Gerichte für den Büroalltag zubereitet. " +
      "Miriam: Genau so etwas suche ich auch! Nach der Arbeit bin ich abends oft zu müde zum Kochen und bestelle mir dann leider oft Tiefkühlpizza. Kann man sich für den Kurs noch anmelden? " +
      "Paul: Unser jetziger Kurs für Anfänger ist zwar schon voll, aber nächsten Monat startet ein neuer Wochenend-Workshop am Samstagvormittag. Außerdem bezahlt unsere Firma sogar dreißig Euro Zuschuss, weil der Kurs zum Gesundheitsprogramm gehört!",
    sections: [
      {
        id: "mt3-d1",
        label: "Miriam",
        speakerRole: "Miriam",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Hallo Paul, ist an deinem Tisch noch ein Platz frei? Oh, du isst heute gar nicht das Tagesgericht aus der Kantine, sondern hast dir selbst etwas von zu Hause mitgebracht!",
      },
      {
        id: "mt3-d2",
        label: "Paul",
        speakerRole: "Paul",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Hi Miriam, setz dich gern! Ja, das ist ein indisches Linsengericht, das wir gestern Abend in meinem neuen Kochkurs an der Volkshochschule gekocht haben. Es war noch so viel übrig, dass es heute perfekt fürs Mittagessen gereicht hat.",
      },
      {
        id: "mt3-d3",
        label: "Miriam",
        speakerRole: "Miriam",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Das riecht fantastisch! Ich wusste gar nicht, dass du einen Kochkurs machst. Ich dachte, du spielst jeden Mittwochabend Badminton in unserer Betriebssportgruppe.",
      },
      {
        id: "mt3-d4",
        label: "Paul",
        speakerRole: "Paul",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Das habe ich bis vor einem Monat auch gemacht. Aber leider habe ich mir beim Joggen im Park das Knie verletzt, und mein Arzt hat mir geraten, für sechs Wochen auf schnelle Ballsportarten zu verzichten.",
      },
      {
        id: "mt3-d5",
        label: "Miriam",
        speakerRole: "Miriam",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Oh, gute Besserung! Und wie gefällt dir der Kochkurs? Sind dort viele Teilnehmer?",
      },
      {
        id: "mt3-d6",
        label: "Paul",
        speakerRole: "Paul",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Wir sind nur acht Personen in einer supermodernen Schulküche. Unser Kursleiter kommt aus Indien und zeigt uns, wie man mit frischen Gewürzen in weniger als dreißig Minuten gesunde Gerichte für den Büroalltag zubereitet.",
      },
      {
        id: "mt3-d7",
        label: "Miriam",
        speakerRole: "Miriam",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Genau so etwas suche ich auch! Nach der Arbeit bin ich abends oft zu müde zum Kochen und bestelle mir dann leider oft Tiefkühlpizza. Kann man sich für den Kurs noch anmelden?",
      },
      {
        id: "mt3-d8",
        label: "Paul",
        speakerRole: "Paul",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Unser jetziger Kurs für Anfänger ist zwar schon voll, aber nächsten Monat startet ein neuer Wochenend-Workshop am Samstagvormittag. Außerdem bezahlt unsere Firma sogar dreißig Euro Zuschuss, weil der Kurs zum Gesundheitsprogramm gehört!",
      },
    ],
    questions: [
      {
        id: "q16",
        itemNumber: 16,
        questionType: "richtig_falsch",
        questionDe: "Paul hat sein heutiges Mittagessen in der Kantine gekauft.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Er hat das indische Linsengericht aus seinem Kochkurs vom Vorabend von zu Hause mitgebracht.",
      },
      {
        id: "q17",
        itemNumber: 17,
        questionType: "richtig_falsch",
        questionDe: "Paul hat sich beim Badmintonspielen in der Sporthalle das Knie verletzt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Er hat sich „beim Joggen im Park das Knie verletzt“.",
      },
      {
        id: "q18",
        itemNumber: 18,
        questionType: "richtig_falsch",
        questionDe: "Der Arzt hat Paul empfohlen, sechs Wochen lang kein Badminton zu spielen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „mein Arzt hat mir geraten, für sechs Wochen auf schnelle Ballsportarten zu verzichten.“",
      },
      {
        id: "q19",
        itemNumber: 19,
        questionType: "richtig_falsch",
        questionDe: "An Pauls Kochkurs nehmen insgesamt acht Personen teil.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Wir sind nur acht Personen in einer supermodernen Schulküche.“",
      },
      {
        id: "q20",
        itemNumber: 20,
        questionType: "richtig_falsch",
        questionDe: "Die Rezepte im Kurs dauern in der Zubereitung meistens länger als zwei Stunden.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Der Kursleiter zeigt, wie man die Gerichte „in weniger als dreißig Minuten“ zubereitet.",
      },
      {
        id: "q21",
        itemNumber: 21,
        questionType: "richtig_falsch",
        questionDe: "Miriam kocht jeden Abend nach der Arbeit frisch zu Hause.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Sie ist abends nach der Arbeit oft zu müde zum Kochen und isst dann Tiefkühlpizza.",
      },
      {
        id: "q22",
        itemNumber: 22,
        questionType: "richtig_falsch",
        questionDe: "Der Arbeitgeber unterstützt die Teilnahme am Kochkurs mit 30 Euro.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Außerdem bezahlt unsere Firma sogar dreißig Euro Zuschuss, weil der Kurs zum Gesundheitsprogramm gehört!“",
      },
    ],
    keyVocab: [
      { german: "das Tagesgericht", meaning: "dish of the day" },
      { german: "verzichten auf (+ Akk.)", meaning: "to do without / refrain from" },
      { german: "zubereiten", meaning: "to prepare (food)" },
      { german: "der Zuschuss", meaning: "subsidy / financial contribution" },
    ],
  },

  {
    id: "bank-hoeren-b1-mt3-teil4",
    skill: "hoeren",
    level: "B1",
    topicDe: "Bildung, Schule & Familie",
    topicEn: "3-Speaker Radio Debate: Should Homework Be Abolished?",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Hören Teil 4 (Radiodiskussion: Hausaufgaben abschaffen? · Nr. 23–30)",
    examPartNumber: 4,
    modelTestNumber: 3,
    examPartLabel: "Hören · Teil 4 (Modelltest 3 · 8 Aufgaben · Wer sagt was?)",
    officialFormatBadge: "3 Sprecher · 8 Aufgaben (Wer sagt was? a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 27,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Teil 4): Sie hören eine Radiodiskussion zum Thema „Brauchen Kinder heute noch klassische Hausaufgaben zu Hause?“. Die Moderatorin spricht mit dem Schulleiter Martin Lenz und der Elternvertreterin Sonja Neumann. Sie hören die Diskussion zweimal (2×). Ordnen Sie die Aussagen 23 bis 30 der richtigen Person zu (a, b oder c).",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Moderatorin: Herzlich willkommen zu unserer Bildungssendung am Mittag! Immer mehr Schulen in Deutschland sind heute Ganztagsschulen, in denen Kinder bis sechzehn Uhr Unterricht haben. Trotzdem sitzen viele Schülerinnen und Schüler abends noch über ihren Heften. Laut einer Umfrage des Bildungsministeriums gibt es in jeder dritten Familie regelmäßig Streit wegen der Hausaufgaben. Darüber spreche ich heute mit dem Schulleiter Martin Lenz und der Elternvertreterin Sonja Neumann. Frau Neumann, warum wollen Sie klassische Hausaufgaben abschaffen? " +
      "Sonja Neumann: Guten Tag! Wenn Kinder erst um sechzehn Uhr nach Hause kommen, brauchen sie Bewegung im Sportverein oder Zeit zum Spielen. Außerdem sind Hausaufgaben oft ungerecht: Kinder, deren Eltern gut Deutsch sprechen oder Nachhilfe bezahlen können, haben einen riesigen Vorteil, während andere Kinder mit schwierigen Aufgaben allein gelassen werden. " +
      "Martin Lenz: Ich verstehe Ihre Sorge wegen der Chancengleichheit sehr gut, Frau Neumann. Aber als Schulleiter und Mathematiklehrer sehe ich täglich, dass man Vokabeln oder Rechenwege nicht allein durch Zuhören im Unterricht beherrscht. Das Gehirn muss neuen Stoff noch einmal selbstständig und in Ruhe wiederholen. " +
      "Moderatorin: Einige Hörer haben uns per E-Mail geschrieben, dass Eltern durch die Hausaufgaben wenigstens sehen, welche Themen ihr Kind gerade in der Schule behandelt. " +
      "Sonja Neumann: Dafür muss ein Kind aber nicht abends um neunzehn Uhr noch Aufsätze schreiben! Übungsphasen gehören in die Schule selbst: Am Nachmittag sollten Lehrkräfte oder Studenten in Lernstunden vor Ort helfen, damit der Feierabend der Familie frei von Schulstress bleibt. " +
      "Martin Lenz: Genau dieses Modell der schulischen Lernzeiten testen wir seit einem Jahr in den Klassen fünf und sechs. Für die älteren Jugendlichen ab Klasse neun halte ich eine halbe Stunde Hausaufgaben zu Hause jedoch weiterhin für unverzichtbar, weil sie für Ausbildung und Studium lernen müssen, ihre Zeit eigenverantwortlich einzuteilen. " +
      "Sonja Neumann: Dann müssen sich die Lehrer einer Klasse aber endlich besser absprechen! Oft geben drei verschiedene Fachlehrer für denselben Tag umfangreiche Aufgaben auf, sodass aus einer halben Stunde schnell zwei Stunden werden. " +
      "Moderatorin: Ein wichtiger Hinweis zum Abschluss unserer Runde! Unser Hörertelefon ist jetzt noch dreißig Minuten geschaltet, falls Sie Ihre eigenen Erfahrungen mit uns teilen möchten.",
    sections: [
      {
        id: "mt3-r1",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Herzlich willkommen zu unserer Bildungssendung am Mittag! Immer mehr Schulen in Deutschland sind heute Ganztagsschulen, in denen Kinder bis sechzehn Uhr Unterricht haben. Trotzdem sitzen viele Schülerinnen und Schüler abends noch über ihren Heften. Laut einer Umfrage des Bildungsministeriums gibt es in jeder dritten Familie regelmäßig Streit wegen der Hausaufgaben. Darüber spreche ich heute mit dem Schulleiter Martin Lenz und der Elternvertreterin Sonja Neumann. Frau Neumann, warum wollen Sie klassische Hausaufgaben abschaffen?",
      },
      {
        id: "mt3-r2",
        label: "c) Sonja Neumann (Elternvertreterin)",
        speakerRole: "Sonja Neumann",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Guten Tag! Wenn Kinder erst um sechzehn Uhr nach Hause kommen, brauchen sie Bewegung im Sportverein oder Zeit zum Spielen. Außerdem sind Hausaufgaben oft ungerecht: Kinder, deren Eltern gut Deutsch sprechen oder Nachhilfe bezahlen können, haben einen riesigen Vorteil, während andere Kinder mit schwierigen Aufgaben allein gelassen werden.",
      },
      {
        id: "mt3-r3",
        label: "b) Martin Lenz (Schulleiter)",
        speakerRole: "Martin Lenz",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Ich verstehe Ihre Sorge wegen der Chancengleichheit sehr gut, Frau Neumann. Aber als Schulleiter und Mathematiklehrer sehe ich täglich, dass man Vokabeln oder Rechenwege nicht allein durch Zuhören im Unterricht beherrscht. Das Gehirn muss neuen Stoff noch einmal selbstständig und in Ruhe wiederholen.",
      },
      {
        id: "mt3-r4",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Einige Hörer haben uns per E-Mail geschrieben, dass Eltern durch die Hausaufgaben wenigstens sehen, welche Themen ihr Kind gerade in der Schule behandelt.",
      },
      {
        id: "mt3-r5",
        label: "c) Sonja Neumann (Elternvertreterin)",
        speakerRole: "Sonja Neumann",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Dafür muss ein Kind aber nicht abends um neunzehn Uhr noch Aufsätze schreiben! Übungsphasen gehören in die Schule selbst: Am Nachmittag sollten Lehrkräfte oder Studenten in Lernstunden vor Ort helfen, damit der Feierabend der Familie frei von Schulstress bleibt.",
      },
      {
        id: "mt3-r6",
        label: "b) Martin Lenz (Schulleiter)",
        speakerRole: "Martin Lenz",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Genau dieses Modell der schulischen Lernzeiten testen wir seit einem Jahr in den Klassen fünf und sechs. Für die älteren Jugendlichen ab Klasse neun halte ich eine halbe Stunde Hausaufgaben zu Hause jedoch weiterhin für unverzichtbar, weil sie für Ausbildung und Studium lernen müssen, ihre Zeit eigenverantwortlich einzuteilen.",
      },
      {
        id: "mt3-r7",
        label: "c) Sonja Neumann (Elternvertreterin)",
        speakerRole: "Sonja Neumann",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Dann müssen sich die Lehrer einer Klasse aber endlich besser absprechen! Oft geben drei verschiedene Fachlehrer für denselben Tag umfangreiche Aufgaben auf, sodass aus einer halben Stunde schnell zwei Stunden werden.",
      },
      {
        id: "mt3-r8",
        label: "a) Moderatorin",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Ein wichtiger Hinweis zum Abschluss unserer Runde! Unser Hörertelefon ist jetzt noch dreißig Minuten geschaltet, falls Sie Ihre eigenen Erfahrungen mit uns teilen möchten.",
      },
    ],
    questions: [
      {
        id: "q23",
        itemNumber: 23,
        questionType: "speaker_match",
        questionDe: "In jeder dritten Familie führen Hausaufgaben laut einer Umfrage oft zu Streit.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin zitiert die Umfrage des Bildungsministeriums (Streit in jeder dritten Familie).",
      },
      {
        id: "q24",
        itemNumber: 24,
        questionType: "speaker_match",
        questionDe: "Hausaufgaben benachteiligen Kinder, deren Eltern zu Hause nicht helfen können.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 2,
        explanation:
          "Sonja Neumann nennt Hausaufgaben ungerecht, weil manche Eltern Nachhilfe bezahlen können und andere Kinder allein gelassen werden.",
      },
      {
        id: "q25",
        itemNumber: 25,
        questionType: "speaker_match",
        questionDe: "Vokabeln und Mathematik muss man nach dem Unterricht noch einmal selbstständig wiederholen.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 1,
        explanation:
          "Martin Lenz betont als Schulleiter und Mathematiklehrer die notwendige selbstständige Wiederholung.",
      },
      {
        id: "q26",
        itemNumber: 26,
        questionType: "speaker_match",
        questionDe: "Durch Hausaufgaben erfahren Eltern nach Ansicht mancher Hörer, was im Unterricht gelernt wird.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin liest diese Hörer-E-Mails vor.",
      },
      {
        id: "q27",
        itemNumber: 27,
        questionType: "speaker_match",
        questionDe: "Kinder sollten ihre Übungen am Nachmittag direkt in der Schule mit Hilfe von Lehrern oder Studenten erledigen.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 2,
        explanation:
          "Sonja Neumann fordert betreute Lernstunden am Nachmittag in der Schule, damit der Familienabend stressfrei bleibt.",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "speaker_match",
        questionDe: "Jugendliche ab der neunten Klasse brauchen Hausaufgaben, um selbstständige Zeiteinteilung für Beruf und Studium zu trainieren.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 1,
        explanation:
          "Martin Lenz hält ab Klasse 9 eine halbe Stunde Hausaufgaben für unverzichtbar für Ausbildung und Studium.",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "speaker_match",
        questionDe: "Verschiedene Fachlehrer stimmen sich oft nicht ab und geben für denselben Tag zu viel auf.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 2,
        explanation:
          "Sonja Neumann kritisiert, dass sich die Lehrer einer Klasse oft nicht absprechen.",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "speaker_match",
        questionDe: "Hörerinnen und Hörer können nach der Sendung noch eine halbe Stunde lang anrufen.",
        options: [
          "a) Die Moderatorin",
          "b) Martin Lenz (Schulleiter)",
          "c) Sonja Neumann (Elternvertreterin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin weist am Schluss auf das Hörertelefon hin.",
      },
    ],
    keyVocab: [
      { german: "die Ganztagsschule", meaning: "all-day school" },
      { german: "die Chancengleichheit", meaning: "equal opportunity" },
      { german: "eigenverantwortlich", meaning: "independently / on one's own responsibility" },
      { german: "sich absprechen", meaning: "to coordinate / consult with each other" },
    ],
  },

  // =========================================================================
  // LESEN · MODELLTEST 2 (TEIL 1, TEIL 2, TEIL 3, TEIL 4, TEIL 5 — 30 AUFGABEN)
  // =========================================================================
  {
    id: "bank-lesen-b1-mt2-teil1",
    skill: "lesen",
    level: "B1",
    topicDe: "Arbeit, Studium & Kultur",
    topicEn: "Personal Blog: My Evening Student Job at the City Theater",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-past",
    title: "Modelltest 2 — Lesen Teil 1 (Blogeintrag: Nebenjob im Theater · Nr. 1–6)",
    examPartNumber: 1,
    modelTestNumber: 2,
    examPartLabel: "Lesen · Teil 1 (Modelltest 2 · 6 Aufgaben · R/F)",
    officialFormatBadge: "Blogeintrag · 6 Aufgaben (Richtig / Falsch) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Lesen Teil 1): Lesen Sie den Blogeintrag von Tim und die Aufgaben 1 bis 6. Wählen Sie: Sind die Aussagen Richtig oder Falsch?",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Tims Studentenblog · Mittwoch, 22. November\n\n" +
      "Als ich im letzten Herbst mein Geschichtsstudium in Hannover begonnen habe, musste ich mir schnell einen Nebenjob suchen, weil mein Zimmer im Studentenwohnheim teurer war als gedacht. Zuerst habe ich zwei Wochen lang als Kellner in einer lauten Pizzeria gearbeitet, doch nach den langen Schichten bis Mitternacht war ich morgens in den Vorlesungen immer völlig übermüdet.\n\n" +
      "Durch einen Aushang am Schwarzen Brett der Universität habe ich dann meine jetzige Stelle beim Stadttheater gefunden. Seit drei Monaten arbeite ich dort an drei Abenden pro Woche beim Einlass und an der Garderobe. Meine Aufgabe ist es, vor Vorstellungsbeginn die Eintrittskarten zu kontrollieren, die Wintermäntel der Gäste entgegenzunehmen und den Besuchern ihre Plätze im Saal zu zeigen.\n\n" +
      "Das Beste an dieser Arbeit beginnt aber, sobald die Türen des Theatersaals um neunzehn Uhr dreißig schließen: Während das Stück auf der Bühne läuft, haben wir an der Garderobe fast zwei Stunden lang Pause! Da es dort ganz ruhig ist, nehme ich immer meine Lehrbücher mit und bereite mich auf meine Prüfungen vor – und werde für diese Zeit sogar bezahlt. Wenn mich eine Aufführung besonders interessiert, darf ich mich kostenlos in die letzte Reihe setzen und zuschauen.\n\n" +
      "Durch den Job habe ich außerdem viele nette Kolleginnen und Kollegen aus anderen Studienfächern kennengelernt. Nur in den Sommerferien im Juli und August hat das Theater geschlossen; für diese Zeit hat mir mein Chef aber schon eine Aushilfsstelle beim Musikfestival im Stadtpark vermittelt.",
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        questionType: "richtig_falsch",
        questionDe: "Tim hat seinen ersten Job in der Pizzeria aufgegeben, weil er morgens an der Universität zu müde war.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Nach den Schichten bis Mitternacht in der Pizzeria war er „morgens in den Vorlesungen immer völlig übermüdet“.",
      },
      {
        id: "q2",
        itemNumber: 2,
        questionType: "richtig_falsch",
        questionDe: "Ein Freund aus dem Studentenwohnheim hat Tim die Stelle im Stadttheater besorgt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Er hat die Stelle „durch einen Aushang am Schwarzen Brett der Universität“ gefunden.",
      },
      {
        id: "q3",
        itemNumber: 3,
        questionType: "richtig_falsch",
        questionDe: "Tim arbeitet im Stadttheater jeden Tag von Montag bis Sonntag.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Er arbeitet dort „an drei Abenden pro Woche“.",
      },
      {
        id: "q4",
        itemNumber: 4,
        questionType: "richtig_falsch",
        questionDe: "Während der Theatervorstellung kann Tim an der ruhigen Garderobe für sein Studium lernen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Während das Stück läuft, hat er fast zwei Stunden Pause, nimmt seine Lehrbücher mit und lernt für seine Prüfungen.",
      },
      {
        id: "q5",
        itemNumber: 5,
        questionType: "richtig_falsch",
        questionDe: "Wenn Tim ein Theaterstück sehen möchte, muss er den halben Ticketpreis bezahlen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „darf ich mich kostenlos in die letzte Reihe setzen und zuschauen.“",
      },
      {
        id: "q6",
        itemNumber: 6,
        questionType: "richtig_falsch",
        questionDe: "Im Juli und August finden im Stadttheater keine Vorstellungen statt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Nur in den Sommerferien im Juli und August hat das Theater geschlossen.“",
      },
    ],
    keyVocab: [
      { german: "der Nebenjob / die Aushilfsstelle", meaning: "side job / temporary job" },
      { german: "übermüdet", meaning: "overtired / exhausted" },
      { german: "die Garderobe", meaning: "cloakroom / coat check" },
      { german: "die Aufführung / die Vorstellung", meaning: "performance / show" },
    ],
  },

  {
    id: "bank-lesen-b1-mt2-teil2",
    skill: "lesen",
    level: "B1",
    topicDe: "Umwelt, Konsum & Bildung",
    topicEn: "2 Press Articles: Mobile Zero-Waste Shop & Reading Mentors in Schools",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-relativsatz",
    title: "Modelltest 2 — Lesen Teil 2 (2 Zeitungsartikel · Nr. 7–12)",
    examPartNumber: 2,
    modelTestNumber: 2,
    examPartLabel: "Lesen · Teil 2 (Modelltest 2 · 6 Aufgaben · a/b/c)",
    officialFormatBadge: "2 Presseartikel · 6 Aufgaben (a/b/c) · ~20 Min.",
    recommendedMinutes: 20,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Lesen Teil 2): Lesen Sie die beiden Zeitungsartikel A und B und die Aufgaben 7 bis 12. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "ARTIKEL A (Zu Aufgaben 7–9): Einkaufen ohne Plastik — Der rollende Unverpackt-Bus auf dem Land\n" +
      "In großen Städten gibt es längst Geschäfte, in denen Kunden Nudeln, Reis, Nüsse oder Waschmittel ohne Plastikverpackung in selbst mitgebrachte Gläser abfüllen können. Für kleine Dörfer lohnt sich ein eigenes Ladengeschäft jedoch oft nicht. Deshalb hat die Jungunternehmerin Mara Scholz in Nordhessen einen alten Linienbus zu einem rollenden Unverpackt-Laden umgebaut. Von Dienstag bis Samstag hält ihr grüner Bus in zehn verschiedenen Gemeinden jeweils für zwei Stunden auf dem Marktplatz. Besonders ältere Dorfbewohner ohne eigenes Auto begrüßen das Angebot, weil der letzte Supermarkt im Nachbarort liegt. Wer beim ersten Besuch kein eigenes Glas dabeihat, kann im Bus kostenlose Pfandgläser ausleihen.\n\n" +
      "ARTIKEL B (Zu Aufgaben 10–12): Freude an Büchern wecken — Ehrenamtliche Vorlesepaten an Grundschulen\n" +
      "Jedes fünfte Kind im Grundschulalter hat heute Schwierigkeiten beim flüssigen Lesen. Um die Lesefreude früh zu fördern, sucht das Projekt „Lesewelten“ in ganz Nordrhein-Westfalen ehrenamtliche Vorlesepatinnen und Vorlesepaten. Einmal pro Woche besuchen die Freiwilligen für eine Stunde eine Grundschule oder einen Kindergarten und lesen in kleinen Gruppen von vier bis fünf Kindern spannende Geschichten vor. Eine pädagogische Ausbildung ist dafür nicht notwendig; allerdings bietet der Verein allen neuen Ehrenamtlichen vor dem Start einen kostenlosen Einführungsworkshop an. Dort lernen sie, wie man durch Fragen zum Mitdenken anregt und passende Kinderbücher für verschiedene Altersstufen auswählt.",
    sections: [
      {
        id: "mt2-art-a",
        label: "Artikel A (Zu Aufgaben 7–9)",
        title: "Einkaufen ohne Plastik — Der rollende Unverpackt-Bus auf dem Land",
        textDe:
          "In großen Städten gibt es längst Geschäfte, in denen Kunden Nudeln, Reis, Nüsse oder Waschmittel ohne Plastikverpackung in selbst mitgebrachte Gläser abfüllen können. Für kleine Dörfer lohnt sich ein eigenes Ladengeschäft jedoch oft nicht. Deshalb hat die Jungunternehmerin Mara Scholz in Nordhessen einen alten Linienbus zu einem rollenden Unverpackt-Laden umgebaut. Von Dienstag bis Samstag hält ihr grüner Bus in zehn verschiedenen Gemeinden jeweils für zwei Stunden auf dem Marktplatz. Besonders ältere Dorfbewohner ohne eigenes Auto begrüßen das Angebot, weil der letzte Supermarkt im Nachbarort liegt. Wer beim ersten Besuch kein eigenes Glas dabeihat, kann im Bus kostenlose Pfandgläser ausleihen.",
      },
      {
        id: "mt2-art-b",
        label: "Artikel B (Zu Aufgaben 10–12)",
        title: "Freude an Büchern wecken — Ehrenamtliche Vorlesepaten an Grundschulen",
        textDe:
          "Jedes fünfte Kind im Grundschulalter hat heute Schwierigkeiten beim flüssigen Lesen. Um die Lesefreude früh zu fördern, sucht das Projekt „Lesewelten“ in ganz Nordrhein-Westfalen ehrenamtliche Vorlesepatinnen und Vorlesepaten. Einmal pro Woche besuchen die Freiwilligen für eine Stunde eine Grundschule oder einen Kindergarten und lesen in kleinen Gruppen von vier bis fünf Kindern spannende Geschichten vor. Eine pädagogische Ausbildung ist dafür nicht notwendig; allerdings bietet der Verein allen neuen Ehrenamtlichen vor dem Start einen kostenlosen Einführungsworkshop an. Dort lernen sie, wie man durch Fragen zum Mitdenken anregt und passende Kinderbücher für verschiedene Altersstufen auswählt.",
      },
    ],
    questions: [
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Warum hat Mara Scholz einen Linienbus zu einem Laden umgebaut?",
        options: [
          "Weil die Mieten in den Großstädten zu hoch geworden sind.",
          "Weil sich ein festes Unverpackt-Geschäft in kleinen Dörfern oft nicht lohnt.",
          "Weil sie nur noch am Sonntag auf Festen verkaufen möchte.",
        ],
        correctIndex: 1,
        explanation:
          "„Für kleine Dörfer lohnt sich ein eigenes Ladengeschäft jedoch oft nicht. Deshalb hat die Jungunternehmerin Mara Scholz ... einen alten Linienbus zu einem rollenden Unverpackt-Laden umgebaut.“",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Warum freuen sich besonders ältere Menschen in den Dörfern über den Bus?",
        options: [
          "Weil sie im Bus kostenlos Kaffee trinken können.",
          "Weil die Lebensmittel dort nur die Hälfte kosten.",
          "Weil viele kein Auto haben und der nächste Supermarkt erst im Nachbarort ist.",
        ],
        correctIndex: 2,
        explanation:
          "„Besonders ältere Dorfbewohner ohne eigenes Auto begrüßen das Angebot, weil der letzte Supermarkt im Nachbarort liegt.“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Was können Kunden tun, die keine eigenen Behälter mitgebracht haben?",
        options: [
          "Im Bus kostenlose Pfandgläser ausleihen.",
          "Plastiktüten für 50 Cent kaufen.",
          "Die Ware erst in der nächsten Woche abholen.",
        ],
        correctIndex: 0,
        explanation:
          "„Wer beim ersten Besuch kein eigenes Glas dabeihat, kann im Bus kostenlose Pfandgläser ausleihen.“",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Wie läuft der Einsatz der Vorlesepaten in den Schulen ab?",
        options: [
          "Sie unterrichten jeden Vormittag eine ganze Schulklasse mit 30 Kindern.",
          "Sie lesen einmal pro Woche für eine Stunde einer kleinen Gruppe von vier bis fünf Kindern vor.",
          "Sie prüfen die Hausaufgaben der Kinder am Nachmittag.",
        ],
        correctIndex: 1,
        explanation:
          "„Einmal pro Woche besuchen die Freiwilligen für eine Stunde eine Grundschule oder einen Kindergarten und lesen in kleinen Gruppen von vier bis fünf Kindern spannende Geschichten vor.“",
      },
      {
        id: "q11",
        itemNumber: 11,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Welche Voraussetzung gilt für Menschen, die Vorlesepate werden möchten?",
        options: [
          "Man muss pensionierter Lehrer sein.",
          "Man braucht keine pädagogische Ausbildung, kann aber vorab einen kostenlosen Workshop besuchen.",
          "Man muss mindestens 100 eigene Kinderbücher mitbringen.",
        ],
        correctIndex: 1,
        explanation:
          "„Eine pädagogische Ausbildung ist dafür nicht notwendig; allerdings bietet der Verein allen neuen Ehrenamtlichen vor dem Start einen kostenlosen Einführungsworkshop an.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Was wird in dem Einführungsworkshop des Vereins vermittelt?",
        options: [
          "Wie man eigene Kinderbücher schreibt und verkauft.",
          "Wie man Kinder durch Fragen zum Mitdenken anregt und passende Bücher auswählt.",
          "Wie man die Leseprüfungen der Schule benotet.",
        ],
        correctIndex: 1,
        explanation:
          "„Dort lernen sie, wie man durch Fragen zum Mitdenken anregt und passende Kinderbücher für verschiedene Altersstufen auswählt.“",
      },
    ],
    keyVocab: [
      { german: "abfüllen", meaning: "to fill / decant into containers" },
      { german: "das Pfandglas", meaning: "returnable deposit jar" },
      { german: "der Vorlesepate", meaning: "volunteer reading mentor" },
      { german: "zum Mitdenken anregen", meaning: "to encourage active thinking" },
    ],
  },

  {
    id: "bank-lesen-b1-mt2-teil3",
    skill: "lesen",
    level: "B1",
    topicDe: "Wohnen, Alltag, Familie & Gesundheit",
    topicEn: "Match 7 Everyday Situations to Classified Ads A–H (or 0)",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-prepositions",
    title: "Modelltest 2 — Lesen Teil 3 (Anzeigen zuordnen · Nr. 13–19)",
    examPartNumber: 3,
    modelTestNumber: 2,
    examPartLabel: "Lesen · Teil 3 (Modelltest 2 · 7 Aufgaben · Anzeigen A–H / 0)",
    officialFormatBadge: "8 Anzeigen (A–H) · 7 Situationen zuordnen · ~15 Min.",
    recommendedMinutes: 15,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Lesen Teil 3): Lesen Sie die Situationen 13 bis 19 und die Anzeigen A bis H. Wählen Sie für jede Situation die passende Anzeige (oder „0 — Keine passende Anzeige“).",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "ANZEIGE A — Nachbarschaftswerkstatt „Holz & Heim“: Sie möchten eigene Möbel bauen oder einen alten Holzstuhl abschleifen, haben aber zu Hause keinen Platz? Mieten Sie unsere Werkbank inkl. Profi-Maschinen stundenweise! Samstags mit Beratung durch einen Tischlermeister.\n\n" +
      "ANZEIGE B — Senioren-Computerhilfe „KlickKlar“: Geduldige Hilfe zu Hause bei der Einrichtung von Smartphones, Tablets, Online-Banking und Videotelefonaten mit den Enkeln. Hausbesuche im gesamten Stadtgebiet.\n\n" +
      "ANZEIGE C — Bio-Gemüsekiste vom Hof Lindental: Jeden Mittwoch frisch geerntetes Obst, Gemüse und Bauernbrot direkt vor Ihre Wohnungstür geliefert! Jederzeit online pausierbar, kein Jahresvertrag.\n\n" +
      "ANZEIGE D — Schwimmschule „Delphin“: Anfängerschwimmkurse für Kinder ab 5 Jahren im warmen Lehrschwimmbecken sowie abendliches Techniktraining (Kraulschwimmen) für Erwachsene.\n\n" +
      "ANZEIGE E — Kleintierpension „Sonnenwiese“: Urlaubsbetreuung für Katzen, Kaninchen und Meerschweinchen in hellen, beheizten Zimmern mit Freigehege. Tierärztliche Betreuung inklusive.\n\n" +
      "ANZEIGE F — Babysitter-Vermittlung des Studentenwerks: Zuverlässige Studierende der Pädagogik betreuen Ihre Kinder stundenweise am Abend oder am Wochenende bei Ihnen zu Hause.\n\n" +
      "ANZEIGE G — Lauftreff „Feierabend-Runner“ im Stadtpark: Jeden Dienstag und Donnerstag um 18:30 Uhr gemeinsames Joggen für Einsteiger (5 km) und Fortgeschrittene (10 km). Kostenlos und ohne Vereinsmitgliedschaft!\n\n" +
      "ANZEIGE H — Fotostudio Lichtblick: Professionelle Bewerbungsfotos, Passbilder sofort zum Mitnehmen sowie Fotografen-Begleitung für Hochzeiten und Familienfeiern.",
    sections: [
      {
        id: "mt2-ad-a",
        label: "Anzeige A",
        title: "Nachbarschaftswerkstatt „Holz & Heim“",
        textDe:
          "Sie möchten eigene Möbel bauen oder einen alten Holzstuhl abschleifen, haben aber zu Hause keinen Platz? Mieten Sie unsere Werkbank inkl. Profi-Maschinen stundenweise! Samstags mit Beratung durch einen Tischlermeister.",
      },
      {
        id: "mt2-ad-b",
        label: "Anzeige B",
        title: "Senioren-Computerhilfe „KlickKlar“",
        textDe:
          "Geduldige Hilfe zu Hause bei der Einrichtung von Smartphones, Tablets, Online-Banking und Videotelefonaten mit den Enkeln. Hausbesuche im gesamten Stadtgebiet.",
      },
      {
        id: "mt2-ad-c",
        label: "Anzeige C",
        title: "Bio-Gemüsekiste vom Hof Lindental",
        textDe:
          "Jeden Mittwoch frisch geerntetes Obst, Gemüse und Bauernbrot direkt vor Ihre Wohnungstür geliefert! Jederzeit online pausierbar, kein Jahresvertrag.",
      },
      {
        id: "mt2-ad-d",
        label: "Anzeige D",
        title: "Schwimmschule „Delphin“",
        textDe:
          "Anfängerschwimmkurse für Kinder ab 5 Jahren im warmen Lehrschwimmbecken sowie abendliches Techniktraining (Kraulschwimmen) für Erwachsene.",
      },
      {
        id: "mt2-ad-e",
        label: "Anzeige E",
        title: "Kleintierpension „Sonnenwiese“",
        textDe:
          "Urlaubsbetreuung für Katzen, Kaninchen und Meerschweinchen in hellen, beheizten Zimmern mit Freigehege. Tierärztliche Betreuung inklusive.",
      },
      {
        id: "mt2-ad-f",
        label: "Anzeige F",
        title: "Babysitter-Vermittlung des Studentenwerks",
        textDe:
          "Zuverlässige Studierende der Pädagogik betreuen Ihre Kinder stundenweise am Abend oder am Wochenende bei Ihnen zu Hause.",
      },
      {
        id: "mt2-ad-g",
        label: "Anzeige G",
        title: "Lauftreff „Feierabend-Runner“ im Stadtpark",
        textDe:
          "Jeden Dienstag und Donnerstag um 18:30 Uhr gemeinsames Joggen für Einsteiger (5 km) und Fortgeschrittene (10 km). Kostenlos und ohne Vereinsmitgliedschaft!",
      },
      {
        id: "mt2-ad-h",
        label: "Anzeige H",
        title: "Fotostudio Lichtblick",
        textDe:
          "Professionelle Bewerbungsfotos, Passbilder sofort zum Mitnehmen sowie Fotografen-Begleitung für Hochzeiten und Familienfeiern.",
      },
    ],
    questions: [
      {
        id: "q13",
        itemNumber: 13,
        sectionLabel: "Situation 13",
        questionType: "ad_match",
        questionDe:
          "Herr Ritter (74) hat zum Geburtstag ein Tablet geschenkt bekommen und sucht jemanden, der zu ihm nach Hause kommt und ihm zeigt, wie man damit Videotelefonate führt.",
        options: [
          "Anzeige A (Nachbarschaftswerkstatt)",
          "Anzeige B (Senioren-Computerhilfe „KlickKlar“)",
          "Anzeige F (Babysitter-Vermittlung)",
          "Anzeige H (Fotostudio)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 1,
        explanation:
          "Anzeige B bietet Hausbesuche bei der Einrichtung von Tablets und Videotelefonaten mit den Enkeln.",
      },
      {
        id: "q14",
        itemNumber: 14,
        sectionLabel: "Situation 14",
        questionType: "ad_match",
        questionDe:
          "Elena hat auf dem Flohmarkt einen alten Holztisch gekauft und möchte ihn am Samstag mit professionellen Werkzeugen selbst renovieren.",
        options: [
          "Anzeige A (Nachbarschaftswerkstatt „Holz & Heim“)",
          "Anzeige C (Bio-Gemüsekiste)",
          "Anzeige E (Kleintierpension)",
          "Anzeige G (Lauftreff)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 0,
        explanation:
          "Anzeige A vermietet Werkbänke inkl. Profi-Maschinen für Holzmöbel (samstags mit Beratung durch einen Tischlermeister).",
      },
      {
        id: "q15",
        itemNumber: 15,
        sectionLabel: "Situation 15",
        questionType: "ad_match",
        questionDe:
          "Familie Albrecht ist am nächsten Samstagabend ins Theater eingeladen und sucht für ihre vierjährige Tochter für vier Stunden eine Betreuung in der eigenen Wohnung.",
        options: [
          "Anzeige B (Computerhilfe)",
          "Anzeige D (Schwimmschule)",
          "Anzeige E (Kleintierpension)",
          "Anzeige F (Babysitter-Vermittlung des Studentenwerks)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 3,
        explanation:
          "Anzeige F vermittelt Studierende, die Kinder stundenweise am Abend oder Wochenende zu Hause betreuen.",
      },
      {
        id: "q16",
        itemNumber: 16,
        sectionLabel: "Situation 16",
        questionType: "ad_match",
        questionDe:
          "David arbeitet viel im Büro und möchte sich zweimal pro Woche nach Feierabend kostenlos einer Gruppe zum Joggen anschließen.",
        options: [
          "Anzeige C (Bio-Gemüsekiste)",
          "Anzeige D (Schwimmschule)",
          "Anzeige G (Lauftreff „Feierabend-Runner“)",
          "Anzeige H (Fotostudio)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 2,
        explanation:
          "Anzeige G: Jeden Dienstag und Donnerstag um 18:30 Uhr gemeinsames Joggen im Stadtpark, kostenlos.",
      },
      {
        id: "q17",
        itemNumber: 17,
        sectionLabel: "Situation 17",
        questionType: "ad_match",
        questionDe:
          "Frau Nguyen möchte ihren alten Laptop verkaufen und sucht ein Geschäft in der Innenstadt, das gebrauchte Computer ankauft.",
        options: [
          "Anzeige A (Nachbarschaftswerkstatt)",
          "Anzeige B (Senioren-Computerhilfe)",
          "Anzeige E (Kleintierpension)",
          "Anzeige H (Fotostudio)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 4,
        explanation:
          "0 — Keine passende Anzeige: Anzeige B hilft nur bei der Einrichtung von Geräten zu Hause, kauft aber keine gebrauchten Laptops an.",
      },
      {
        id: "q18",
        itemNumber: 18,
        sectionLabel: "Situation 18",
        questionType: "ad_match",
        questionDe:
          "Karin fährt im Sommer für zehn Tage weg und sucht eine Unterkunft mit Tierarzt-Betreuung, in der ihre zwei Kaninchen in dieser Zeit versorgt werden.",
        options: [
          "Anzeige C (Bio-Gemüsekiste)",
          "Anzeige E (Kleintierpension „Sonnenwiese“)",
          "Anzeige F (Babysitter-Vermittlung)",
          "Anzeige G (Lauftreff)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 1,
        explanation:
          "Anzeige E bietet Urlaubsbetreuung für Katzen, Kaninchen und Meerschweinchen inkl. tierärztlicher Betreuung.",
      },
      {
        id: "q19",
        itemNumber: 19,
        sectionLabel: "Situation 19",
        questionType: "ad_match",
        questionDe:
          "Stefan kann zwar Brustschwimmen, möchte aber an einem Abendkurs für Erwachsene teilnehmen, um das Kraulschwimmen richtig zu lernen.",
        options: [
          "Anzeige A (Nachbarschaftswerkstatt)",
          "Anzeige D (Schwimmschule „Delphin“)",
          "Anzeige G (Lauftreff)",
          "Anzeige H (Fotostudio)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 1,
        explanation:
          "Anzeige D bietet „abendliches Techniktraining (Kraulschwimmen) für Erwachsene“.",
      },
    ],
    keyVocab: [
      { german: "stundenweise mieten", meaning: "to rent by the hour" },
      { german: "der Hausbesuch", meaning: "home visit" },
      { german: "pausierbar", meaning: "can be paused anytime" },
      { german: "die Urlaubsbetreuung", meaning: "holiday care / boarding" },
    ],
  },

  {
    id: "bank-lesen-b1-mt2-teil4",
    skill: "lesen",
    level: "B1",
    topicDe: "Arbeit, Konsum & Gesellschaft",
    topicEn: "7 Reader Comments: Should Shops Be Open Every Sunday?",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 2 — Lesen Teil 4 (7 Lesermeinungen: Sonntagsöffnung · Nr. 20–26)",
    examPartNumber: 4,
    modelTestNumber: 2,
    examPartLabel: "Lesen · Teil 4 (Modelltest 2 · 7 Aufgaben · Ja / Nein)",
    officialFormatBadge: "7 Personen · 7 Aufgaben (Ja = Dafür / Nein = Dagegen) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Lesen Teil 4): In einem Online-Magazin lesen Sie Kommentare zur Frage „Sollten Supermärkte und Geschäfte auch am Sonntag geöffnet sein?“. Entscheiden Sie bei den Aufgaben 20 bis 26: Ist die Person FÜR die Sonntagsöffnung (Ja) oder DAGEGEN (Nein)?",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "20 · Sabine (42, Verkäuferin im Modehaus): Ich arbeite bereits von Montag bis Samstag oft bis zwanzig Uhr. Der Sonntag ist der einzige feste Tag in der Woche, an dem meine Kinder, mein Mann und ich gemeinsam am Mittagstisch sitzen können. Wer an sechs Tagen keine Zeit zum Einkaufen findet, plant einfach falsch. Bitte lasst den Sonntag frei!\n\n" +
      "21 · Florian (28, Softwareentwickler): Da ich unter der Woche viel reise und samstags oft im Sportverein helfe, wäre ein geöffneter Supermarkt am Sonntag für mich eine riesige Erleichterung. In vielen anderen Ländern funktioniert das doch auch problemlos, und Studierende würden sich über gut bezahlte Sonntagsschichten freuen.\n\n" +
      "22 · Hannelore (67, Rentnerin): Ich genieße es sehr, dass es am Sonntag in unserer Stadt endlich einmal ruhig ist und kein Lieferverkehr durch die Straßen rollt. Ein gemeinsamer Ruhetag tut der ganzen Gesellschaft gut, deshalb sollten die Läden am Sonntag unbedingt geschlossen bleiben.\n\n" +
      "23 · Tarek (35, Inhaber eines Buchladens): Große Kaufhäuser könnten sich zusätzliches Personal für den Sonntag vielleicht leisten, aber ich müsste an sieben Tagen selbst hinter der Kasse stehen, um keine Kunden an die Konkurrenz zu verlieren. Die Menschen geben dadurch ja nicht mehr Geld aus, sondern verteilen ihre Einkäufe nur auf sieben Tage. Ich bin klar dagegen.\n\n" +
      "24 · Vanessa (31, Ärztin im Krankenhaus): Im Krankenhaus, bei der Feuerwehr oder in Restaurants arbeiten Menschen schließlich auch am Sonntag! Wenn ich am Sonntagvormittag aus dem Dienst komme, stehe ich oft vor einem leeren Kühlschrank. Ich fände es zeitgemäß, wenn Geschäfte selbst entscheiden dürften, am Sonntag zu öffnen.\n\n" +
      "25 · Jan (22, Student): Früher dachte ich auch, dass man am Sonntag unbedingt einkaufen müsste. Seit ich aber selbst neben dem Studium samstags im Supermarkt an der Kasse sitze, weiß ich, wie erschöpfend die Arbeit im Einzelhandel ist. Das Personal braucht diesen freien Sonntag dringend zur Erholung.\n\n" +
      "26 · Rolf (54, Tourismusmanager): In unserer historischen Altstadt stehen ausländische Touristen am Sonntag oft enttäuscht vor verschlossenen Schaufenstern und fahren dann früher wieder ab. Wenn die Geschäfte am Sonntag öffnen dürften, würden unsere Innenstädte deutlich lebendiger und attraktiver werden.",
    sections: [
      {
        id: "mt2-p20",
        label: "Aufgabe 20 · Sabine (42, Verkäuferin)",
        textDe:
          "Ich arbeite bereits von Montag bis Samstag oft bis zwanzig Uhr. Der Sonntag ist der einzige feste Tag in der Woche, an dem meine Kinder, mein Mann und ich gemeinsam am Mittagstisch sitzen können. Wer an sechs Tagen keine Zeit zum Einkaufen findet, plant einfach falsch. Bitte lasst den Sonntag frei!",
      },
      {
        id: "mt2-p21",
        label: "Aufgabe 21 · Florian (28, Softwareentwickler)",
        textDe:
          "Da ich unter der Woche viel reise und samstags oft im Sportverein helfe, wäre ein geöffneter Supermarkt am Sonntag für mich eine riesige Erleichterung. In vielen anderen Ländern funktioniert das doch auch problemlos, und Studierende würden sich über gut bezahlte Sonntagsschichten freuen.",
      },
      {
        id: "mt2-p22",
        label: "Aufgabe 22 · Hannelore (67, Rentnerin)",
        textDe:
          "Ich genieße es sehr, dass es am Sonntag in unserer Stadt endlich einmal ruhig ist und kein Lieferverkehr durch die Straßen rollt. Ein gemeinsamer Ruhetag tut der ganzen Gesellschaft gut, deshalb sollten die Läden am Sonntag unbedingt geschlossen bleiben.",
      },
      {
        id: "mt2-p23",
        label: "Aufgabe 23 · Tarek (35, Buchhändler)",
        textDe:
          "Große Kaufhäuser könnten sich zusätzliches Personal für den Sonntag vielleicht leisten, aber ich müsste an sieben Tagen selbst hinter der Kasse stehen, um keine Kunden an die Konkurrenz zu verlieren. Die Menschen geben dadurch ja nicht mehr Geld aus, sondern verteilen ihre Einkäufe nur auf sieben Tage. Ich bin klar dagegen.",
      },
      {
        id: "mt2-p24",
        label: "Aufgabe 24 · Vanessa (31, Ärztin)",
        textDe:
          "Im Krankenhaus, bei der Feuerwehr oder in Restaurants arbeiten Menschen schließlich auch am Sonntag! Wenn ich am Sonntagvormittag aus dem Dienst komme, stehe ich oft vor einem leeren Kühlschrank. Ich fände es zeitgemäß, wenn Geschäfte selbst entscheiden dürften, am Sonntag zu öffnen.",
      },
      {
        id: "mt2-p25",
        label: "Aufgabe 25 · Jan (22, Student)",
        textDe:
          "Früher dachte ich auch, dass man am Sonntag unbedingt einkaufen müsste. Seit ich aber selbst neben dem Studium samstags im Supermarkt an der Kasse sitze, weiß ich, wie erschöpfend die Arbeit im Einzelhandel ist. Das Personal braucht diesen freien Sonntag dringend zur Erholung.",
      },
      {
        id: "mt2-p26",
        label: "Aufgabe 26 · Rolf (54, Tourismusmanager)",
        textDe:
          "In unserer historischen Altstadt stehen ausländische Touristen am Sonntag oft enttäuscht vor verschlossenen Schaufenstern und fahren dann früher wieder ab. Wenn die Geschäfte am Sonntag öffnen dürften, würden unsere Innenstädte deutlich lebendiger und attraktiver werden.",
      },
    ],
    questions: [
      {
        id: "q20",
        itemNumber: 20,
        sectionLabel: "Person 1 · Sabine (42)",
        questionType: "ja_nein",
        questionDe: "Ist Sabine (42) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: „Der Sonntag ist der einzige feste Tag in der Woche ... Bitte lasst den Sonntag frei!“",
      },
      {
        id: "q21",
        itemNumber: 21,
        sectionLabel: "Person 2 · Florian (28)",
        questionType: "ja_nein",
        questionDe: "Ist Florian (28) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „wäre ein geöffneter Supermarkt am Sonntag für mich eine riesige Erleichterung.“",
      },
      {
        id: "q22",
        itemNumber: 22,
        sectionLabel: "Person 3 · Hannelore (67)",
        questionType: "ja_nein",
        questionDe: "Ist Hannelore (67) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: „deshalb sollten die Läden am Sonntag unbedingt geschlossen bleiben.“",
      },
      {
        id: "q23",
        itemNumber: 23,
        sectionLabel: "Person 4 · Tarek (35)",
        questionType: "ja_nein",
        questionDe: "Ist Tarek (35) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: Als kleiner Ladeninhaber müsste er 7 Tage selbst an der Kasse stehen („Ich bin klar dagegen“).",
      },
      {
        id: "q24",
        itemNumber: 24,
        sectionLabel: "Person 5 · Vanessa (31)",
        questionType: "ja_nein",
        questionDe: "Ist Vanessa (31) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Ich fände es zeitgemäß, wenn Geschäfte selbst entscheiden dürften, am Sonntag zu öffnen.“",
      },
      {
        id: "q25",
        itemNumber: 25,
        sectionLabel: "Person 6 · Jan (22)",
        questionType: "ja_nein",
        questionDe: "Ist Jan (22) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein (Achtung, Meinungswechsel!): Früher war er dafür, aber seit er selbst an der Kasse arbeitet, sagt er: „Das Personal braucht diesen freien Sonntag dringend zur Erholung.“",
      },
      {
        id: "q26",
        itemNumber: 26,
        sectionLabel: "Person 7 · Rolf (54)",
        questionType: "ja_nein",
        questionDe: "Ist Rolf (54) für geöffnete Geschäfte am Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Wenn die Geschäfte am Sonntag öffnen dürften, würden unsere Innenstädte deutlich lebendiger und attraktiver werden.“",
      },
    ],
    keyVocab: [
      { german: "die Erleichterung", meaning: "relief / convenience" },
      { german: "der Ruhetag", meaning: "rest day / closing day" },
      { german: "der Einzelhandel", meaning: "retail sector" },
      { german: "zeitgemäß", meaning: "contemporary / in keeping with the times" },
    ],
  },

  {
    id: "bank-lesen-b1-mt2-teil5",
    skill: "lesen",
    level: "B1",
    topicDe: "Freizeit, Sport & Sicherheit",
    topicEn: "Official Swimming Pool & Sauna Rules (Haus- und Badeordnung)",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-passiv",
    title: "Modelltest 2 — Lesen Teil 5 (Haus- und Badeordnung Hallenbad · Nr. 27–30)",
    examPartNumber: 5,
    modelTestNumber: 2,
    examPartLabel: "Lesen · Teil 5 (Modelltest 2 · 4 Aufgaben · a/b/c)",
    officialFormatBadge: "Offizielle Regeln · 4 Aufgaben (a/b/c) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 14,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 2 · Lesen Teil 5): Lesen Sie die Haus- und Badeordnung des städtischen Hallenbades „AquaPark“ und die Aufgaben 27 bis 30. Wählen Sie die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungssatz (bfu.goethe.de)",
    sourceUrl: "https://bfu.goethe.de/b1_m/",
    passageDe:
      "Haus- und Badeordnung — Städtisches Hallenbad & Saunawelt „AquaPark“\n\n" +
      "§ 1 Zutritt und Begleitung von Kindern\n" +
      "Kindern unter 10 Jahren ist der Zutritt zum Hallenbad nur in Begleitung einer volljährigen Aufsichtsperson (mindestens 18 Jahre) gestattet. Der Kassenschluss erfolgt täglich 60 Minuten vor dem Ende der Öffnungszeit; die Schwimmbecken müssen 15 Minuten vor Schließung verlassen werden.\n\n" +
      "§ 2 Kleidung, Hygiene und Wertsachen\n" +
      "Der Barfußbereich ab den Umkleidekabinen darf nicht mit Straßenschuhen betreten werden. Vor dem Betreten der Schwimmbecken ist das gründliche Duschen Pflicht. Für den Verlust von Bargeld oder Schmuck in den Kleiderschränken übernimmt das Bad keine Haftung; nutzen Sie für Wertsachen bitte die kostenlosen Tresorfächer direkt gegenüber der Kasse.\n\n" +
      "§ 3 Regeln im Schwimm- und Saunabereich\n" +
      "Das seitliche Einspringen vom Beckenrand sowie die Nutzung von Flossen und Schnorcheln im großen Sportbecken sind aus Sicherheitsgründen untersagt. Im gesamten Saunabereich gilt ein striktes Verbot für Smartphones, Kameras und elektronische Lesegeräte mit Kamera. In den Saunakabinen ist ein ausreichend großes Badehandtuch unter den gesamten Körper zu legen.\n\n" +
      "§ 4 Speisen und Getränke\n" +
      "Zerbrechliche Behälter aus Glas oder Porzellan dürfen im gesamten Bad nicht mitgeführt werden. Selbst mitgebrachte Speisen und Getränke in Plastikflaschen dürfen ausschließlich auf der ausgewiesenen Picknickempore im Obergeschoss verzehrt werden.",
    questions: [
      {
        id: "q27",
        itemNumber: 27,
        questionType: "mcq",
        questionDe: "Wann müssen Badegäste das Wasser in den Schwimmbecken spätestens verlassen?",
        options: [
          "60 Minuten vor dem Ende der Öffnungszeit.",
          "15 Minuten vor der Schließung des Bades.",
          "Erst genau zur Schließzeit.",
        ],
        correctIndex: 1,
        explanation:
          "§ 1: „die Schwimmbecken müssen 15 Minuten vor Schließung verlassen werden.“ (60 Minuten vorher ist nur der Kassenschluss.)",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "mcq",
        questionDe: "Wo sollten Besucher Bargeld und Schmuck sicher aufbewahren?",
        options: [
          "In den normalen Kleiderschränken, da diese voll versichert sind.",
          "An der Rezeption der Saunawelt abgeben.",
          "In den kostenlosen Tresorfächern gegenüber der Kasse.",
        ],
        correctIndex: 2,
        explanation:
          "§ 2: „Für den Verlust von Bargeld oder Schmuck in den Kleiderschränken übernimmt das Bad keine Haftung; nutzen Sie für Wertsachen bitte die kostenlosen Tresorfächer direkt gegenüber der Kasse.“",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "mcq",
        questionDe: "Welche Vorschrift gilt im Saunabereich?",
        options: [
          "Man darf dort keine Smartphones oder Geräte mit Kamera benutzen.",
          "Kinder unter 10 Jahren dürfen nur allein in die Sauna.",
          "Man muss Badeschuhe in der Saunakabine anlassen.",
        ],
        correctIndex: 0,
        explanation:
          "§ 3: „Im gesamten Saunabereich gilt ein striktes Verbot für Smartphones, Kameras und elektronische Lesegeräte mit Kamera.“",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "mcq",
        questionDe: "Was gilt für selbst mitgebrachtes Essen und Trinken?",
        options: [
          "Man darf Glasflaschen mit an den Beckenrand nehmen.",
          "Mitgebrachtes Essen ist im gesamten Hallenbad verboten.",
          "Speisen und Getränke in Plastikflaschen sind nur auf der Picknickempore im Obergeschoss erlaubt.",
        ],
        correctIndex: 2,
        explanation:
          "§ 4: „Selbst mitgebrachte Speisen und Getränke in Plastikflaschen dürfen ausschließlich auf der ausgewiesenen Picknickempore im Obergeschoss verzehrt werden.“",
      },
    ],
    keyVocab: [
      { german: "die volljährige Aufsichtsperson", meaning: "adult supervisor (18+)" },
      { german: "der Kassenschluss", meaning: "last admission / ticket desk closing" },
      { german: "keine Haftung übernehmen", meaning: "to accept no liability" },
      { german: "verzehren", meaning: "to consume (food/drink)" },
    ],
  },

  // =========================================================================
  // LESEN · MODELLTEST 3 (TEIL 1, TEIL 2, TEIL 3, TEIL 4, TEIL 5 — 30 AUFGABEN)
  // =========================================================================
  {
    id: "bank-lesen-b1-mt3-teil1",
    skill: "lesen",
    level: "B1",
    topicDe: "Reisen, Wohnen & Urlaub",
    topicEn: "Personal Email: Our First Home-Exchange Vacation in Vienna",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-past",
    title: "Modelltest 3 — Lesen Teil 1 (E-Mail: Wohnungstausch-Urlaub in Wien · Nr. 1–6)",
    examPartNumber: 1,
    modelTestNumber: 3,
    examPartLabel: "Lesen · Teil 1 (Modelltest 3 · 6 Aufgaben · R/F)",
    officialFormatBadge: "Persönliche E-Mail · 6 Aufgaben (Richtig / Falsch) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Lesen Teil 1): Lesen Sie die E-Mail von Sofia an ihre Freundin Hanna und die Aufgaben 1 bis 6. Wählen Sie: Sind die Aussagen Richtig oder Falsch?",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Liebe Hanna,\n\n" +
      "seit gestern sind Markus und ich wieder zurück in Hamburg, und ich muss dir unbedingt von unserem Sommerurlaub erzählen! Zum ersten Mal haben wir dieses Jahr kein Hotel gebucht, sondern über eine Internetplattform für zwei Wochen unsere Wohnung mit einer Familie aus Wien getauscht. Während wir in ihrer Altbauwohnung in Wien wohnten, machte das österreichische Ehepaar mit seinem Sohn Urlaub in unserer Hamburger Wohnung.\n\n" +
      "Vor der Abreise war Markus ehrlich gesagt ziemlich skeptisch, weil er ein ungutes Gefühl dabei hatte, fremde Menschen in unseren eigenen Betten schlafen zu lassen. Doch nachdem wir zweimal per Video miteinander telefoniert hatten, waren uns Maria und Georg sofort sympathisch. Das Schönste war: Keiner von uns musste einen Cent für die Übernachtung bezahlen!\n\n" +
      "Als wir in Wien ankamen, lag auf dem Küchentisch bereits ein handgeschriebener Zettel mit ihren persönlichen Lieblingscafés und Bäckereien im Viertel. So haben wir kleine Lokale entdeckt, die in keinem Reiseführer stehen. Einziger kleiner Auftrag für uns war es, jeden Abend ihre Blumen auf der Terrasse zu gießen und den Kater „Milo“ zu füttern, der tagsüber im Innenhof herumspazierte.\n\n" +
      "Auch unsere Wohnung in Hamburg haben wir gestern blitzsauber vorgefunden – auf dem Esstisch stand sogar eine Schachtel Wiener Sachertorte als Dankeschön. Für nächstes Frühjahr planen wir schon den nächsten Wohnungstausch, diesmal vielleicht in Zürich!\n\n" +
      "Liebe Grüße, deine Sofia",
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        questionType: "richtig_falsch",
        questionDe: "Sofia und Markus haben für die zwei Wochen in der Wiener Wohnung eine günstige Miete bezahlt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Keiner von uns musste einen Cent für die Übernachtung bezahlen!“",
      },
      {
        id: "q2",
        itemNumber: 2,
        questionType: "richtig_falsch",
        questionDe: "Markus hatte anfangs Bedenken, Fremde in der eigenen Wohnung übernachten zu lassen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Vor der Abreise war Markus ehrlich gesagt ziemlich skeptisch, weil er ein ungutes Gefühl dabei hatte, fremde Menschen in unseren eigenen Betten schlafen zu lassen.“",
      },
      {
        id: "q3",
        itemNumber: 3,
        questionType: "richtig_falsch",
        questionDe: "Sofia und Markus haben die Familie aus Wien vor der Reise per Videotelefonat kennengelernt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „nachdem wir zweimal per Video miteinander telefoniert hatten, waren uns Maria und Georg sofort sympathisch.“",
      },
      {
        id: "q4",
        itemNumber: 4,
        questionType: "richtig_falsch",
        questionDe: "Die Wiener Familie hat Sofia einen gedruckten Reiseführer aus dem Buchhandel geschenkt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Auf dem Tisch lag ein handgeschriebener Zettel mit persönlichen Lieblingscafés, die in keinem Reiseführer stehen.",
      },
      {
        id: "q5",
        itemNumber: 5,
        questionType: "richtig_falsch",
        questionDe: "Sofia und Markus haben sich in Wien um die Pflanzen und die Katze der Familie gekümmert.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Sie mussten „jeden Abend ihre Blumen auf der Terrasse gießen und den Kater ‚Milo‘ füttern“.",
      },
      {
        id: "q6",
        itemNumber: 6,
        questionType: "richtig_falsch",
        questionDe: "Bei der Rückkehr nach Hamburg mussten Sofia und Markus ihre eigene Wohnung erst gründlich putzen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Auch unsere Wohnung in Hamburg haben wir gestern blitzsauber vorgefunden.“",
      },
    ],
    keyVocab: [
      { german: "skeptisch sein / ein ungutes Gefühl haben", meaning: "to be skeptical / have an uneasy feeling" },
      { german: "der Reiseführer", meaning: "travel guide" },
      { german: "Blumen gießen", meaning: "to water flowers" },
      { german: "blitzsauber", meaning: "spotlessly clean" },
    ],
  },

  {
    id: "bank-lesen-b1-mt3-teil2",
    skill: "lesen",
    level: "B1",
    topicDe: "Gesundheit, Digitales & Nachhaltigkeit",
    topicEn: "2 Press Articles: Video Doctor Consultations & Library of Things",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Lesen Teil 2 (2 Zeitungsartikel · Nr. 7–12)",
    examPartNumber: 2,
    modelTestNumber: 3,
    examPartLabel: "Lesen · Teil 2 (Modelltest 3 · 6 Aufgaben · a/b/c)",
    officialFormatBadge: "2 Presseartikel · 6 Aufgaben (a/b/c) · ~20 Min.",
    recommendedMinutes: 20,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Lesen Teil 2): Lesen Sie die beiden Zeitungsartikel A und B und die Aufgaben 7 bis 12. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "ARTIKEL A (Zu Aufgaben 7–9): Zum Hausarzt per Bildschirm — Die Videosprechstunde wächst\n" +
      "Wer unter einer leichten Erkältung leidet oder nur die Ergebnisse einer Blutuntersuchung besprechen möchte, muss heute nicht mehr unbedingt eine Stunde im vollen Wartezimmer sitzen. Fast jede dritte Hausarztpraxis in Deutschland bietet inzwischen an bestimmten Nachmittagen eine Videosprechstunde über das Smartphone oder den Computer an. Für Berufstätige und Patienten mit eingeschränkter Mobilität spart das viel Zeit, und gleichzeitig sinkt die Ansteckungsgefahr in der Praxis. Ärzteverbände betonen jedoch, dass das Gespräch am Bildschirm den persönlichen Besuch nur ergänzen, aber nicht komplett ersetzen kann: Bei unklaren Bauchschmerzen oder Herzbeschwerden ist eine körperliche Untersuchung vor Ort weiterhin unverzichtbar.\n\n" +
      "ARTIKEL B (Zu Aufgaben 10–12): Leihen statt kaufen — Die „Bibliothek der Dinge“ in der Stadtbücherei\n" +
      "Eine Bohrmaschine wird in einem durchschnittlichen Haushalt während ihrer gesamten Lebensdauer nur etwa dreizehn Minuten lang benutzt. Dennoch liegt in fast jedem Keller ein eigener Werkzeugkoffer. Um Ressourcen zu schonen und Menschen mit kleinen Wohnungen zu unterstützen, hat die Stadtbücherei Münster eine sogenannte „Bibliothek der Dinge“ eröffnet. Mit dem normalen Büchereiausweis können Bürger dort neben Büchern auch Nähmaschinen, Hochdruckreiniger, Campingzelte oder Beamer für einen Filmabend kostenlos für eine Woche ausleihen. Vor der nächsten Ausleihe prüft ein ehrenamtliches Technikteam alle zurückgegebenen Geräte auf ihre Sicherheit.",
    sections: [
      {
        id: "mt3-art-a",
        label: "Artikel A (Zu Aufgaben 7–9)",
        title: "Zum Hausarzt per Bildschirm — Die Videosprechstunde wächst",
        textDe:
          "Wer unter einer leichten Erkältung leidet oder nur die Ergebnisse einer Blutuntersuchung besprechen möchte, muss heute nicht mehr unbedingt eine Stunde im vollen Wartezimmer sitzen. Fast jede dritte Hausarztpraxis in Deutschland bietet inzwischen an bestimmten Nachmittagen eine Videosprechstunde über das Smartphone oder den Computer an. Für Berufstätige und Patienten mit eingeschränkter Mobilität spart das viel Zeit, und gleichzeitig sinkt die Ansteckungsgefahr in der Praxis. Ärzteverbände betonen jedoch, dass das Gespräch am Bildschirm den persönlichen Besuch nur ergänzen, aber nicht komplett ersetzen kann: Bei unklaren Bauchschmerzen oder Herzbeschwerden ist eine körperliche Untersuchung vor Ort weiterhin unverzichtbar.",
      },
      {
        id: "mt3-art-b",
        label: "Artikel B (Zu Aufgaben 10–12)",
        title: "Leihen statt kaufen — Die „Bibliothek der Dinge“ in der Stadtbücherei",
        textDe:
          "Eine Bohrmaschine wird in einem durchschnittlichen Haushalt während ihrer gesamten Lebensdauer nur etwa dreizehn Minuten lang benutzt. Dennoch liegt in fast jedem Keller ein eigener Werkzeugkoffer. Um Ressourcen zu schonen und Menschen mit kleinen Wohnungen zu unterstützen, hat die Stadtbücherei Münster eine sogenannte „Bibliothek der Dinge“ eröffnet. Mit dem normalen Büchereiausweis können Bürger dort neben Büchern auch Nähmaschinen, Hochdruckreiniger, Campingzelte oder Beamer für einen Filmabend kostenlos für eine Woche ausleihen. Vor der nächsten Ausleihe prüft ein ehrenamtliches Technikteam alle zurückgegebenen Geräte auf ihre Sicherheit.",
      },
    ],
    questions: [
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Welchen Vorteil bietet die Videosprechstunde laut dem Text?",
        options: [
          "Sie ist auch ohne Krankenversicherung im Ausland nutzbar.",
          "Man spart Zeit im Wartezimmer und verringert die Ansteckungsgefahr in der Praxis.",
          "Medikamente werden sofort kostenlos nach Hause geschickt.",
        ],
        correctIndex: 1,
        explanation:
          "„Für Berufstätige und Patienten mit eingeschränkter Mobilität spart das viel Zeit, und gleichzeitig sinkt die Ansteckungsgefahr in der Praxis.“",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Wofür eignet sich die Videosprechstunde laut Artikel gut?",
        options: [
          "Für die Untersuchung unklarer Herzbeschwerden.",
          "Für Operationen und Blutabnahmen.",
          "Bei einer leichten Erkältung oder zur Besprechung von Blutwerten.",
        ],
        correctIndex: 2,
        explanation:
          "„Wer unter einer leichten Erkältung leidet oder nur die Ergebnisse einer Blutuntersuchung besprechen möchte...“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Was sagen Ärzteverbände über die Videosprechstunde?",
        options: [
          "Sie kann den Arztbesuch ergänzen, aber bei Beschwerden wie Bauch- oder Herzschmerzen nicht ersetzen.",
          "Sie wird in fünf Jahren alle Arztpraxen vor Ort ersetzen.",
          "Sie sollte nur für junge Menschen unter 30 Jahren erlaubt sein.",
        ],
        correctIndex: 0,
        explanation:
          "„dass das Gespräch am Bildschirm den persönlichen Besuch nur ergänzen, aber nicht komplett ersetzen kann...“",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Warum wurde die „Bibliothek der Dinge“ in Münster gegründet?",
        options: [
          "Weil die Bücherei zu wenige gedruckte Bücher hatte.",
          "Um Ressourcen zu schonen, da viele Alltagsgeräte zu Hause nur sehr selten genutzt werden.",
          "Um gebrauchte Werkzeuge von Baumärkten teuer weiterzuverkaufen.",
        ],
        correctIndex: 1,
        explanation:
          "Viele Geräte wie eine Bohrmaschine werden nur 13 Minuten im Leben genutzt; die „Bibliothek der Dinge“ schont Ressourcen und hilft Menschen mit kleinen Wohnungen.",
      },
      {
        id: "q11",
        itemNumber: 11,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Was braucht man, um dort ein Zelt oder eine Nähmaschine für eine Woche auszuleihen?",
        options: [
          "Den normalen Büchereiausweis (die Ausleihe ist kostenlos).",
          "Einen Handwerksmeisterbrief.",
          "Eine Leihgebühr von 25 Euro pro Tag.",
        ],
        correctIndex: 0,
        explanation:
          "„Mit dem normalen Büchereiausweis können Bürger dort ... kostenlos für eine Woche ausleihen.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Wer kontrolliert die Geräte nach der Rückgabe?",
        options: [
          "Die Kunden selbst beim Ausfüllen eines Formulars.",
          "Ein ehrenamtliches Technikteam.",
          "Der Hersteller der Bohrmaschinen.",
        ],
        correctIndex: 1,
        explanation:
          "„Vor der nächsten Ausleihe prüft ein ehrenamtliches Technikteam alle zurückgegebenen Geräte auf ihre Sicherheit.“",
      },
    ],
    keyVocab: [
      { german: "die Videosprechstunde", meaning: "video consultation" },
      { german: "die Ansteckungsgefahr", meaning: "risk of infection / contagion" },
      { german: "Ressourcen schonen", meaning: "to conserve resources" },
      { german: "die Bohrmaschine", meaning: "power drill" },
    ],
  },

  {
    id: "bank-lesen-b1-mt3-teil3",
    skill: "lesen",
    level: "B1",
    topicDe: "Bildung, Freizeit, Reisen & Kultur",
    topicEn: "Match 7 Everyday Situations to Classified Ads A–H (or 0)",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-prepositions",
    title: "Modelltest 3 — Lesen Teil 3 (Anzeigen zuordnen · Nr. 13–19)",
    examPartNumber: 3,
    modelTestNumber: 3,
    examPartLabel: "Lesen · Teil 3 (Modelltest 3 · 7 Aufgaben · Anzeigen A–H / 0)",
    officialFormatBadge: "8 Anzeigen (A–H) · 7 Situationen zuordnen · ~15 Min.",
    recommendedMinutes: 15,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Lesen Teil 3): Lesen Sie die Situationen 13 bis 19 und die Anzeigen A bis H. Wählen Sie für jede Situation die passende Anzeige (oder „0 — Keine passende Anzeige“).",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "ANZEIGE A — Ferien-Forschungscamp im Naturkundemuseum: Ganztägiges Ferienprogramm in den Oster- und Sommerferien für Schulkinder von 8 bis 12 Jahren (8:00–16:30 Uhr inkl. warmem Mittagessen). Experimente, Mikroskopieren und Waldrallye!\n\n" +
      "ANZEIGE B — Tanzschule „Rhythmus“: Salsa-, Walzer- und Tango-Abendkurse für Paare sowie eigener Single-Tanzkurs ohne festen Tanzpartner jeden Freitag um 19 Uhr.\n\n" +
      "ANZEIGE C — Buchhandlung & Lesecafé „Seitenblick“: Große Auswahl an Romanen, Kinderbüchern und fremdsprachiger Literatur auf Englisch, Spanisch und Französisch. Jeden ersten Donnerstag im Monat Autorenlesung!\n\n" +
      "ANZEIGE D — Bewerbungscoaching „KarriereStart“: Wir prüfen Ihren deutschen Lebenslauf und Ihr Anschreiben und trainieren mit Ihnen typische Fragen für das Vorstellungsgespräch. Einzelberatung vor Ort oder online.\n\n" +
      "ANZEIGE E — Kanuverleih & Bootstouren „Flussabenteuer“: Mieten Sie 2er- und 4er-Kanus für entspannte Tagestouren auf der Lahn! Inklusive Schwimmwesten, wasserdichten Tonnen und Rücktransport zum Startpunkt.\n\n" +
      "ANZEIGE F — Chor „Stimmbande“ im Kulturzentrum: Wir suchen neue Sängerinnen und Sänger für Pop, Jazz und Weltmusik! Proben jeden Montag 19:30 Uhr. Notenkenntnisse sind nicht erforderlich.\n\n" +
      "ANZEIGE G — Erste-Hilfe-Kurse beim Roten Kreuz: Kompaktkurs an einem Samstag (9–17 Uhr) für Führerscheinbewerber, Betriebshelfer und junge Eltern. Offizielle Bescheinigung sofort am Kursende.\n\n" +
      "ANZEIGE H — Flohmarkt & Kleidertauschbörse in der Markthalle: Jeden zweiten Sonntag im Monat! Verkaufen Sie gut erhaltene Kleidung, Spielzeug und Bücher oder tauschen Sie kostenlos an unserem Tauschstand.",
    sections: [
      {
        id: "mt3-ad-a",
        label: "Anzeige A",
        title: "Ferien-Forschungscamp im Naturkundemuseum",
        textDe:
          "Ganztägiges Ferienprogramm in den Oster- und Sommerferien für Schulkinder von 8 bis 12 Jahren (8:00–16:30 Uhr inkl. warmem Mittagessen). Experimente, Mikroskopieren und Waldrallye!",
      },
      {
        id: "mt3-ad-b",
        label: "Anzeige B",
        title: "Tanzschule „Rhythmus“",
        textDe:
          "Salsa-, Walzer- und Tango-Abendkurse für Paare sowie eigener Single-Tanzkurs ohne festen Tanzpartner jeden Freitag um 19 Uhr.",
      },
      {
        id: "mt3-ad-c",
        label: "Anzeige C",
        title: "Buchhandlung & Lesecafé „Seitenblick“",
        textDe:
          "Große Auswahl an Romanen, Kinderbüchern und fremdsprachiger Literatur auf Englisch, Spanisch und Französisch. Jeden ersten Donnerstag im Monat Autorenlesung!",
      },
      {
        id: "mt3-ad-d",
        label: "Anzeige D",
        title: "Bewerbungscoaching „KarriereStart“",
        textDe:
          "Wir prüfen Ihren deutschen Lebenslauf und Ihr Anschreiben und trainieren mit Ihnen typische Fragen für das Vorstellungsgespräch. Einzelberatung vor Ort oder online.",
      },
      {
        id: "mt3-ad-e",
        label: "Anzeige E",
        title: "Kanuverleih & Bootstouren „Flussabenteuer“",
        textDe:
          "Mieten Sie 2er- und 4er-Kanus für entspannte Tagestouren auf der Lahn! Inklusive Schwimmwesten, wasserdichten Tonnen und Rücktransport zum Startpunkt.",
      },
      {
        id: "mt3-ad-f",
        label: "Anzeige F",
        title: "Chor „Stimmbande“ im Kulturzentrum",
        textDe:
          "Wir suchen neue Sängerinnen und Sänger für Pop, Jazz und Weltmusik! Proben jeden Montag 19:30 Uhr. Notenkenntnisse sind nicht erforderlich.",
      },
      {
        id: "mt3-ad-g",
        label: "Anzeige G",
        title: "Erste-Hilfe-Kurse beim Roten Kreuz",
        textDe:
          "Kompaktkurs an einem Samstag (9–17 Uhr) für Führerscheinbewerber, Betriebshelfer und junge Eltern. Offizielle Bescheinigung sofort am Kursende.",
      },
      {
        id: "mt3-ad-h",
        label: "Anzeige H",
        title: "Flohmarkt & Kleidertauschbörse in der Markthalle",
        textDe:
          "Jeden zweiten Sonntag im Monat! Verkaufen Sie gut erhaltene Kleidung, Spielzeug und Bücher oder tauschen Sie kostenlos an unserem Tauschstand.",
      },
    ],
    questions: [
      {
        id: "q13",
        itemNumber: 13,
        sectionLabel: "Situation 13",
        questionType: "ad_match",
        questionDe:
          "Herr und Frau Lindner müssen in den Sommerferien beide tagsüber arbeiten und suchen für ihren zehnjährigen Sohn eine spannende Ganztagsbetreuung mit Mittagessen.",
        options: [
          "Anzeige A (Ferien-Forschungscamp im Naturkundemuseum)",
          "Anzeige C (Buchhandlung)",
          "Anzeige E (Kanuverleih)",
          "Anzeige G (Erste-Hilfe-Kurs)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 0,
        explanation:
          "Anzeige A bietet ein ganztägiges Ferienprogramm (8:00–16:30 Uhr inkl. warmem Mittagessen) für Kinder von 8 bis 12 Jahren.",
      },
      {
        id: "q14",
        itemNumber: 14,
        sectionLabel: "Situation 14",
        questionType: "ad_match",
        questionDe:
          "Amira hat ihr Ingenieurstudium abgeschlossen und möchte vor ihrer ersten Bewerbung ihren deutschen Lebenslauf professionell korrigieren lassen und das Vorstellungsgespräch üben.",
        options: [
          "Anzeige B (Tanzschule)",
          "Anzeige D (Bewerbungscoaching „KarriereStart“)",
          "Anzeige F (Chor)",
          "Anzeige G (Erste-Hilfe-Kurs)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 1,
        explanation:
          "Anzeige D prüft Lebenslauf/Anschreiben und trainiert das Vorstellungsgespräch.",
      },
      {
        id: "q15",
        itemNumber: 15,
        sectionLabel: "Situation 15",
        questionType: "ad_match",
        questionDe:
          "Lukas macht gerade seinen Autoführerschein und benötigt an einem Wochenende die gesetzlich vorgeschriebene Erste-Hilfe-Bescheinigung.",
        options: [
          "Anzeige A (Forschungscamp)",
          "Anzeige D (Bewerbungscoaching)",
          "Anzeige E (Kanuverleih)",
          "Anzeige G (Erste-Hilfe-Kurse beim Roten Kreuz)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 3,
        explanation:
          "Anzeige G bietet den Kompaktkurs an einem Samstag für Führerscheinbewerber inkl. offizieller Bescheinigung.",
      },
      {
        id: "q16",
        itemNumber: 16,
        sectionLabel: "Situation 16",
        questionType: "ad_match",
        questionDe:
          "Claudia liebt es zu singen, kann aber keine Noten lesen und sucht für Montagabend eine Gruppe für moderne Musik.",
        options: [
          "Anzeige B (Tanzschule)",
          "Anzeige C (Lesecafé)",
          "Anzeige F (Chor „Stimmbande“)",
          "Anzeige H (Flohmarkt)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 2,
        explanation:
          "Anzeige F: Pop, Jazz und Weltmusik jeden Montag um 19:30 Uhr, „Notenkenntnisse sind nicht erforderlich“.",
      },
      {
        id: "q17",
        itemNumber: 17,
        sectionLabel: "Situation 17",
        questionType: "ad_match",
        questionDe:
          "Marco möchte gerne Salsa tanzen lernen, hat aber keine Tanzpartnerin und sucht deshalb einen Kurs speziell für Einzelpersonen.",
        options: [
          "Anzeige B (Tanzschule „Rhythmus“)",
          "Anzeige E (Kanuverleih)",
          "Anzeige F (Chor)",
          "Anzeige H (Kleidertauschbörse)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 0,
        explanation:
          "Anzeige B bietet einen eigenen „Single-Tanzkurs ohne festen Tanzpartner jeden Freitag um 19 Uhr“.",
      },
      {
        id: "q18",
        itemNumber: 18,
        sectionLabel: "Situation 18",
        questionType: "ad_match",
        questionDe:
          "Familie Krug möchte ihren großen Garten umgestalten und sucht einen Gärtner, der am Wochenende Bäume schneidet und einen neuen Rasen anlegt.",
        options: [
          "Anzeige A (Forschungscamp)",
          "Anzeige E (Kanuverleih)",
          "Anzeige G (Rotes Kreuz)",
          "Anzeige H (Flohmarkt)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 4,
        explanation:
          "0 — Keine passende Anzeige: Keine der Anzeigen A–H bietet Gartenarbeit oder Baumschnitt an.",
      },
      {
        id: "q19",
        itemNumber: 19,
        sectionLabel: "Situation 19",
        questionType: "ad_match",
        questionDe:
          "Vier Freunde möchten am Sonntag einen Ausflug auf dem Wasser machen und dafür ein Boot für vier Personen inklusive Schwimmwesten ausleihen.",
        options: [
          "Anzeige A (Forschungscamp)",
          "Anzeige B (Tanzschule)",
          "Anzeige E (Kanuverleih & Bootstouren „Flussabenteuer“)",
          "Anzeige H (Flohmarkt)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 2,
        explanation:
          "Anzeige E vermietet 2er- und 4er-Kanus für Tagestouren auf der Lahn inklusive Schwimmwesten.",
      },
    ],
    keyVocab: [
      { german: "fremdsprachige Literatur", meaning: "foreign-language literature" },
      { german: "das Anschreiben", meaning: "cover letter" },
      { german: "die Notenkenntnisse", meaning: "ability to read sheet music" },
      { german: "die Schwimmweste", meaning: "life jacket" },
    ],
  },

  {
    id: "bank-lesen-b1-mt3-teil4",
    skill: "lesen",
    level: "B1",
    topicDe: "Umwelt, Verkehr & Stadtleben",
    topicEn: "7 Reader Comments: One Car-Free Sunday Per Month in All Cities?",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Lesen Teil 4 (7 Lesermeinungen: Autofreier Sonntag · Nr. 20–26)",
    examPartNumber: 4,
    modelTestNumber: 3,
    examPartLabel: "Lesen · Teil 4 (Modelltest 3 · 7 Aufgaben · Ja / Nein)",
    officialFormatBadge: "7 Personen · 7 Aufgaben (Ja = Dafür / Nein = Dagegen) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Lesen Teil 4): Lesen Sie 7 Leserkommentare zum Vorschlag „Einmal im Monat ein autofreier Sonntag in allen Großstädten“. Entscheiden Sie bei den Aufgaben 20 bis 26: Ist die Person FÜR den autofreien Sonntag (Ja) oder DAGEGEN (Nein)?",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "20 · Katrin (37, Mutter von zwei Kindern): Wenn unsere Hauptstraße einmal im Monat frei von Autos wäre, könnten Kinder endlich sicher mit Roller und Fahrrad auf der Straße fahren und Nachbarn würden auf dem Bürgersteig zusammen Kaffee trinken. Ich unterstütze diesen Vorschlag aus vollem Herzen!\n\n" +
      "21 · Matthias (49, Taxifahrer und Familienvater): Für Menschen mit einem Bürojob von Montag bis Freitag klingt das romantisch, aber viele Schichtarbeiter, Pflegekräfte oder Familien, die am Sonntag ihre Großeltern auf dem Land besuchen wollen, sind auf ihr Auto angewiesen. Ein solches Fahrverbot geht völlig an der Realität vorbei.\n\n" +
      "22 · Leonie (25, Umweltstudentin): Ein einziger autofreier Sonntag im Monat zeigt den Menschen ganz praktisch, wie angenehm und leise eine Stadt ohne Abgase sein kann. Solche positiven Aktionstage überzeugen viel besser als theoretische Vorträge über den Klimawandel. Unbedingt einführen!\n\n" +
      "23 · Werner (61, Restaurantbesitzer am Stadtrand): Viele meiner Sonntagsgäste sind ältere Ehepaare aus anderen Stadtteilen, die mit dem Auto zu unserem Ausflugslokal kommen. Ohne Auto würden sie am Sonntag zu Hause bleiben, und mir würde mein wichtigster Umsatztag im Monat fehlen. Deshalb lehne ich die Idee ab.\n\n" +
      "24 · Nadja (32, Sportlehrerin): In Paris oder Brüssel gibt es solche autofreien Sonntage schon lange, und dort verwandelt sich die ganze Stadt jedes Mal in ein fröhliches Volksfest für Läufer, Skater und Familien. Auch unsere deutschen Städte sollten diesen Mut endlich aufbringen!\n\n" +
      "25 · Philipp (41, Umweltingenieur): Als Ingenieur für Klimaschutz wünsche ich mir natürlich sauberere Luft. Aber ein symbolisches Verbot an zwölf Sonntagen im Jahr bringt für das Klima fast gar nichts, weil der Berufsverkehr von Montag bis Freitag das eigentliche Problem ist. Statt solcher Symbolpolitik sollten wir lieber die Radwege verbessern.\n\n" +
      "26 · Gisela (70, Rentnerin): Ich wohne an einer vierspurigen Ausfallstraße und kann wegen des Lärms kaum mein Schlafzimmerfenster öffnen. Wenigstens an einem Sonntag im Monat beim Vogelgezwitscher statt beim Motorenlärm aufzuwachen, wäre für mich ein großes Geschenk.",
    sections: [
      {
        id: "mt3-p20",
        label: "Aufgabe 20 · Katrin (37, Mutter)",
        textDe:
          "Wenn unsere Hauptstraße einmal im Monat frei von Autos wäre, könnten Kinder endlich sicher mit Roller und Fahrrad auf der Straße fahren und Nachbarn würden auf dem Bürgersteig zusammen Kaffee trinken. Ich unterstütze diesen Vorschlag aus vollem Herzen!",
      },
      {
        id: "mt3-p21",
        label: "Aufgabe 21 · Matthias (49, Taxifahrer)",
        textDe:
          "Für Menschen mit einem Bürojob von Montag bis Freitag klingt das romantisch, aber viele Schichtarbeiter, Pflegekräfte oder Familien, die am Sonntag ihre Großeltern auf dem Land besuchen wollen, sind auf ihr Auto angewiesen. Ein solches Fahrverbot geht völlig an der Realität vorbei.",
      },
      {
        id: "mt3-p22",
        label: "Aufgabe 22 · Leonie (25, Studentin)",
        textDe:
          "Ein einziger autofreier Sonntag im Monat zeigt den Menschen ganz praktisch, wie angenehm und leise eine Stadt ohne Abgase sein kann. Solche positiven Aktionstage überzeugen viel besser als theoretische Vorträge über den Klimawandel. Unbedingt einführen!",
      },
      {
        id: "mt3-p23",
        label: "Aufgabe 23 · Werner (61, Restaurantbesitzer)",
        textDe:
          "Viele meiner Sonntagsgäste sind ältere Ehepaare aus anderen Stadtteilen, die mit dem Auto zu unserem Ausflugslokal kommen. Ohne Auto würden sie am Sonntag zu Hause bleiben, und mir würde mein wichtigster Umsatztag im Monat fehlen. Deshalb lehne ich die Idee ab.",
      },
      {
        id: "mt3-p24",
        label: "Aufgabe 24 · Nadja (32, Sportlehrerin)",
        textDe:
          "In Paris oder Brüssel gibt es solche autofreien Sonntage schon lange, und dort verwandelt sich die ganze Stadt jedes Mal in ein fröhliches Volksfest für Läufer, Skater und Familien. Auch unsere deutschen Städte sollten diesen Mut endlich aufbringen!",
      },
      {
        id: "mt3-p25",
        label: "Aufgabe 25 · Philipp (41, Umweltingenieur)",
        textDe:
          "Als Ingenieur für Klimaschutz wünsche ich mir natürlich sauberere Luft. Aber ein symbolisches Verbot an zwölf Sonntagen im Jahr bringt für das Klima fast gar nichts, weil der Berufsverkehr von Montag bis Freitag das eigentliche Problem ist. Statt solcher Symbolpolitik sollten wir lieber die Radwege verbessern.",
      },
      {
        id: "mt3-p26",
        label: "Aufgabe 26 · Gisela (70, Rentnerin)",
        textDe:
          "Ich wohne an einer vierspurigen Ausfallstraße und kann wegen des Lärms kaum mein Schlafzimmerfenster öffnen. Wenigstens an einem Sonntag im Monat beim Vogelgezwitscher statt beim Motorenlärm aufzuwachen, wäre für mich ein großes Geschenk.",
      },
    ],
    questions: [
      {
        id: "q20",
        itemNumber: 20,
        sectionLabel: "Person 1 · Katrin (37)",
        questionType: "ja_nein",
        questionDe: "Ist Katrin (37) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Ich unterstütze diesen Vorschlag aus vollem Herzen!“",
      },
      {
        id: "q21",
        itemNumber: 21,
        sectionLabel: "Person 2 · Matthias (49)",
        questionType: "ja_nein",
        questionDe: "Ist Matthias (49) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: „Ein solches Fahrverbot geht völlig an der Realität vorbei.“",
      },
      {
        id: "q22",
        itemNumber: 22,
        sectionLabel: "Person 3 · Leonie (25)",
        questionType: "ja_nein",
        questionDe: "Ist Leonie (25) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Unbedingt einführen!“",
      },
      {
        id: "q23",
        itemNumber: 23,
        sectionLabel: "Person 4 · Werner (61)",
        questionType: "ja_nein",
        questionDe: "Ist Werner (61) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: „Deshalb lehne ich die Idee ab.“",
      },
      {
        id: "q24",
        itemNumber: 24,
        sectionLabel: "Person 5 · Nadja (32)",
        questionType: "ja_nein",
        questionDe: "Ist Nadja (32) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Auch unsere deutschen Städte sollten diesen Mut endlich aufbringen!“",
      },
      {
        id: "q25",
        itemNumber: 25,
        sectionLabel: "Person 6 · Philipp (41)",
        questionType: "ja_nein",
        questionDe: "Ist Philipp (41) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein (Prüfungsfalle!): Er ist zwar Umweltingenieur, hält das Sonntagsverbot aber für nutzlose Symbolpolitik („bringt für das Klima fast gar nichts“).",
      },
      {
        id: "q26",
        itemNumber: 26,
        sectionLabel: "Person 7 · Gisela (70)",
        questionType: "ja_nein",
        questionDe: "Ist Gisela (70) für einen monatlichen autofreien Sonntag?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „wäre für mich ein großes Geschenk.“",
      },
    ],
    keyVocab: [
      { german: "angewiesen sein auf (+ Akk.)", meaning: "to depend / rely on" },
      { german: "die Abgase", meaning: "exhaust fumes" },
      { german: "der Umsatztag", meaning: "revenue / business day" },
      { german: "die Symbolpolitik", meaning: "tokenism / symbolic politics" },
    ],
  },

  {
    id: "bank-lesen-b1-mt3-teil5",
    skill: "lesen",
    level: "B1",
    topicDe: "Bildung, Prüfungen & Verwaltung",
    topicEn: "Official Exam Registration & Cancellation Policy (VHS Sprachprüfungen)",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-passiv",
    title: "Modelltest 3 — Lesen Teil 5 (Prüfungsordnung Volkshochschule · Nr. 27–30)",
    examPartNumber: 5,
    modelTestNumber: 3,
    examPartLabel: "Lesen · Teil 5 (Modelltest 3 · 4 Aufgaben · a/b/c)",
    officialFormatBadge: "Offizielle Regeln · 4 Aufgaben (a/b/c) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 14,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Lesen Teil 5): Lesen Sie die Teilnahmebedingungen für Sprachprüfungen an der Volkshochschule und die Aufgaben 27 bis 30. Wählen Sie die richtige Lösung a, b oder c.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    passageDe:
      "Teilnahmebedingungen für offizielle Sprachprüfungen — Volkshochschule (VHS)\n\n" +
      "§ 1 Anmeldung und Prüfungsgebühr\n" +
      "Die Anmeldung zu einer Sprachprüfung muss spätestens drei Wochen vor dem Prüfungstermin schriftlich oder über das Online-Portal erfolgen. Ein Prüfungsplatz ist erst dann verbindlich reserviert, wenn die vollständige Prüfungsgebühr auf dem Konto der Volkshochschule eingegangen ist.\n\n" +
      "§ 2 Rücktritt und Krankheit\n" +
      "Ein Rücktritt von der Prüfung ist bis 14 Tage vor dem Prüfungstermin gegen eine Bearbeitungsgebühr von 20 Euro möglich. Bei einer späteren Absage wird die Prüfungsgebühr nur dann erstattet, wenn spätestens drei Werktage nach dem Prüfungstag ein ärztliches Attest im Prüfungsbüro vorgelegt wird.\n\n" +
      "§ 3 Ausweispflicht und Hilfsmittel am Prüfungstag\n" +
      "Alle Teilnehmenden müssen sich am Prüfungstag 30 Minuten vor Beginn mit einem gültigen amtlichen Lichtbildausweis (Reisepass oder Personalausweis) ausweisen. Wörterbücher, eigene Notizzettel sowie ausgeschaltete Mobiltelefone und Smartwatches müssen vor Prüfungsbeginn in den Schließfächern vor dem Saal hinterlegt werden.\n\n" +
      "§ 4 Ergebnisse und Zertifikate\n" +
      "Die Auswertung dauert in der Regel vier Wochen. Aus Datenschutzgründen dürfen Prüfungsergebnisse nicht telefonisch mitgeteilt werden. Das offizielle Zertifikat wird per Einschreiben an Ihre Wohnadresse geschickt oder kann persönlich gegen Unterschrift im Servicebüro abgeholt werden.",
    questions: [
      {
        id: "q27",
        itemNumber: 27,
        questionType: "mcq",
        questionDe: "Wann ist ein Platz für die Sprachprüfung fest reserviert?",
        options: [
          "Sobald man das Online-Formular ausgefüllt hat.",
          "Erst wenn die gesamte Prüfungsgebühr auf dem Konto der VHS eingegangen ist.",
          "Wenn man 30 Minuten vor Prüfungsbeginn im Saal erscheint.",
        ],
        correctIndex: 1,
        explanation:
          "§ 1: „Ein Prüfungsplatz ist erst dann verbindlich reserviert, wenn die vollständige Prüfungsgebühr auf dem Konto der Volkshochschule eingegangen ist.“",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "mcq",
        questionDe: "Unter welcher Bedingung bekommt man das Geld zurück, wenn man zwei Tage vor der Prüfung krank wird?",
        options: [
          "Man muss spätestens drei Werktage nach der Prüfung ein ärztliches Attest vorlegen.",
          "Bei einer Absage unter 14 Tagen bekommt man nie Geld zurück.",
          "Man muss nur kurz im Prüfungsbüro anrufen.",
        ],
        correctIndex: 0,
        explanation:
          "§ 2: „Bei einer späteren Absage wird die Prüfungsgebühr nur dann erstattet, wenn spätestens drei Werktage nach dem Prüfungstag ein ärztliches Attest im Prüfungsbüro vorgelegt wird.“",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "mcq",
        questionDe: "Was gilt am Prüfungstag für Mobiltelefone, auch wenn sie ausgeschaltet sind?",
        options: [
          "Sie dürfen ausgeschaltet in der Jackentasche im Saal bleiben.",
          "Sie müssen vor Beginn in den Schließfächern vor dem Saal eingeschlossen werden.",
          "Sie dürfen als Uhr auf den Tisch gelegt werden.",
        ],
        correctIndex: 1,
        explanation:
          "§ 3: „Wörterbücher, eigene Notizzettel sowie ausgeschaltete Mobiltelefone und Smartwatches müssen vor Prüfungsbeginn in den Schließfächern vor dem Saal hinterlegt werden.“",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "mcq",
        questionDe: "Wie erhält man nach vier Wochen sein Prüfungsergebnis bzw. Zertifikat?",
        options: [
          "Telefonisch über das Servicebüro.",
          "Per Post (Einschreiben) oder durch persönliche Abholung gegen Unterschrift.",
          "Automatisch am Abend des Prüfungstages per SMS.",
        ],
        correctIndex: 1,
        explanation:
          "§ 4: Telefonisch dürfen keine Ergebnisse mitgeteilt werden; das Zertifikat kommt per Einschreiben oder wird persönlich gegen Unterschrift abgeholt.",
      },
    ],
    keyVocab: [
      { german: "verbindlich reserviert", meaning: "bindingly reserved" },
      { german: "das ärztliche Attest", meaning: "doctor's certificate / medical note" },
      { german: "der amtliche Lichtbildausweis", meaning: "official photo ID" },
      { german: "per Einschreiben", meaning: "by registered mail" },
    ],
  },

  // =========================================================================
  // SCHREIBEN · MODELLTEST 3 (AUFGABE 1, AUFGABE 2, AUFGABE 3)
  // =========================================================================
  {
    id: "bank-schreiben-b1-mt3-aufgabe1",
    skill: "schreiben",
    level: "B1",
    topicDe: "Gesundheit, Sport & Freizeit",
    topicEn: "Informal Email: Completed My First 10 km City Run",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-past",
    title: "Modelltest 3 — Schreiben Aufgabe 1 (Informelle E-Mail: Stadtlauf · ~80 Wörter)",
    examPartNumber: 1,
    modelTestNumber: 3,
    examPartLabel: "Schreiben · Aufgabe 1 (Modelltest 3 · ~80 Wörter)",
    officialFormatBadge: "Informelle E-Mail („du“) · 3 Leitpunkte · 20 Min. · 40 Punkte",
    recommendedMinutes: 20,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Schreiben Aufgabe 1 · 20 Min. · 40 Punkte): Schreiben Sie eine persönliche E-Mail (ca. 80 Wörter) zu allen 3 Inhaltspunkten.",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    writingPromptDe:
      "Sie haben am letzten Sonntag zum ersten Mal an einem Zehn-Kilometer-Stadtlauf teilgenommen. Schreiben Sie Ihrem Freund / Ihrer Freundin Ben davon.",
    writingBulletsDe: [
      "Beschreiben Sie: Wie war der Lauf und wie haben Sie sich darauf vorbereitet?",
      "Begründen Sie: Warum hat Ihnen diese Veranstaltung besonders gut gefallen?",
      "Schlagen Sie Ben vor, im nächsten Monat gemeinsam für den nächsten Lauf zu trainieren.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Zuerst war ich ziemlich nervös, aber...", meaning: "At first I was quite nervous, but..." },
      { german: "Die Stimmung entlang der Strecke war fantastisch.", meaning: "The atmosphere along the route was fantastic." },
      { german: "Hättest du Lust, ab nächster Woche zusammen zu joggen?", meaning: "Would you feel like jogging together starting next week?" },
    ],
  },
  {
    id: "bank-schreiben-b1-mt3-aufgabe2",
    skill: "schreiben",
    level: "B1",
    topicDe: "Arbeit, Bildung & Gesellschaft",
    topicEn: "Online Forum Opinion: Compulsory Social Year for Young People?",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-nebensatz",
    title: "Modelltest 3 — Schreiben Aufgabe 2 (Forumsbeitrag: Soziales Pflichtjahr · ~80 Wörter)",
    examPartNumber: 2,
    modelTestNumber: 3,
    examPartLabel: "Schreiben · Aufgabe 2 (Modelltest 3 · ~80 Wörter)",
    officialFormatBadge: "Online-Gästebuch · Meinungsäußerung · 25 Min. · 40 Punkte",
    recommendedMinutes: 25,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Modelltest 3 · Schreiben Aufgabe 2 · 25 Min. · 40 Punkte): Lesen Sie den Beitrag aus einem Online-Gästebuch und schreiben Sie Ihre Meinung dazu (ca. 80 Wörter).",
    source: "verified_bank",
    sourceCredit: "Goethe-Institut B1 Übungsmaterialien (goethe.de)",
    sourceUrl: "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
    writingContextQuoteDe:
      "www.jugend-debatte-online.de · Gästebuch zum Thema „Soziales Pflichtjahr nach der Schule“\n" +
      "Sabine_W (Gestern, 19:05 Uhr): „Ich finde, jeder junge Mensch sollte nach dem Schulabschluss ein halbes oder ganzes Jahr in einem Krankenhaus, Kindergarten oder beim Umweltschutz mitarbeiten. Dabei sammelt man wertvolle Lebenserfahrung und tut etwas Gutes für die Gesellschaft!“",
    writingPromptDe:
      "Schreiben Sie nun Ihren eigenen Diskussionsbeitrag zum Thema „Soziales Jahr nach der Schule: Pflicht oder freiwillig?“ im Online-Gästebuch (ca. 80 Wörter).",
    writingBulletsDe: [
      "Beziehen Sie sich kurz auf den Beitrag von Sabine_W und äußern Sie Ihre Meinung.",
      "Nennen Sie Vorteile und mögliche Nachteile eines sozialen Pflichtjahres für Jugendliche.",
      "Erklären Sie, wie es in Ihrem Heimatland geregelt ist oder was Sie besser fänden.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Ich stimme Sabine teilweise zu, dass...", meaning: "I partly agree with Sabine that..." },
      { german: "Ein freiwilliges soziales Jahr ist besser als Zwang.", meaning: "A voluntary social year is better than compulsion." },
      { german: "Man lernt dabei, Verantwortung zu übernehmen.", meaning: "One learns to take responsibility in the process." },
    ],
  },
];
