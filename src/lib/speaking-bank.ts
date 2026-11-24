import { CefrLevel, ModuleCategory, StudyModule } from "./types";

export type SpeakingBankItem = Omit<
  StudyModule,
  "id" | "order" | "status" | "completedCount"
> & {
  bankId: string;
};

/**
 * 34+ authentic, high-frequency Goethe-Zertifikat B1 (plus A2/B2) Speaking Exam cards
 * covering Teil 1 (Gemeinsam etwas planen), Teil 2 (Ein Thema präsentieren),
 * and Teil 3 (Rückmeldung & Diskussion) for intensive pattern drilling.
 */
export const GOETHE_SPEAKING_BANK: SpeakingBankItem[] = [
  // =========================================================================
  // TEIL 1: GEMEINSAM ETWAS PLANEN (12 Classic Goethe Exam Scenarios)
  // =========================================================================
  {
    bankId: "spk-t1-01",
    title: "Teil 1: Planning a Surprise Birthday Party",
    titleDe: "Teil 1: Eine Überraschungsparty zum Geburtstag planen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Ihre gemeinsame Freundin Anna wird nächsten Samstag 30 Jahre alt. Planen Sie zusammen eine Überraschungsparty: 1) Wann und wo feiern?, 2) Essen und Getränke, 3) Welches Geschenk kaufen?, 4) Wer schreibt die Einladungen?",
    coachRole: "Ihr Freund Lukas (möchte bei gutem Wetter lieber ein Picknick im Park machen)",
    learnerGoal:
      "Besprechen Sie alle 4 Leitpunkte, machen Sie höfliche Vorschläge im Konjunktiv II und einigen Sie sich darauf, wer welche Aufgabe übernimmt.",
    grammarFocus: ["Konjunktiv II (wir könnten, wäre es gut)", "Nebensätze mit falls / wenn"],
    keyVocabulary: [
      "Ich schlage vor, dass...",
      "Was hältst du davon, wenn...?",
      "Ich kümmere mich um...",
      "Einverstanden, machen wir das so!",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-02",
    title: "Teil 1: Helping a Friend Move Apartments",
    titleDe: "Teil 1: Einem Freund beim Umzug helfen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Ihr Kursteilnehmer Tim zieht diesen Sonntag in eine neue Wohnung um. Planen Sie gemeinsam, wie Sie ihm helfen: 1) Wann treffen?, 2) Welches Fahrzeug / Transporter mieten?, 3) Wer packt oder trägt was?, 4) Was essen wir nach dem Umzug?",
    coachRole: "Ihre Kurspartnerin Sarah (hat einen Führerschein und kann einen kleinen Transporter fahren)",
    learnerGoal:
      "Teilen Sie die Aufgaben fair auf, einigen Sie sich auf Treffpunkt und Transport und planen Sie etwas zu essen für die Helfer.",
    grammarFocus: ["Modalverben + Infinitiv", "Dativ (beim Umzug helfen)"],
    keyVocabulary: [
      "einen Transporter mieten",
      "Kartons tragen",
      "Hast du einen Führerschein?",
      "Danach könnten wir Pizza bestellen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-03",
    title: "Teil 1: Organizing a Weekend Cycling Trip",
    titleDe: "Teil 1: Einen gemeinsamen Fahrradausflug am Wochenende planen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Sie und Ihr Gesprächspartner möchten am Wochenende eine Fahrradtour um einen See machen. Einigen Sie sich auf: 1) Samstag oder Sonntag + Uhrzeit?, 2) Welche Route / Wohin?, 3) Was zum Picknick mitnehmen?, 4) Was tun bei Regen?",
    coachRole: "Ihr Freund Jonas (kann am Sonntag erst ab 10:30 Uhr starten)",
    learnerGoal:
      "Verhandeln Sie Tag und Uhrzeit, planen Sie das Picknick und einigen Sie sich auf eine Alternative bei schlechtem Wetter.",
    grammarFocus: ["Nebensätze mit falls / obwohl", "Vorschläge mit Konjunktiv II"],
    keyVocabulary: [
      "eine Route aussuchen",
      "Proviant mitnehmen",
      "Falls es regnet, könnten wir...",
      "Das passt mir super",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-04",
    title: "Teil 1: Buying a Farewell Gift for Your German Teacher",
    titleDe: "Teil 1: Ein Abschiedsgeschenk für die Deutschlehrerin aussuchen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Ihr Deutschkurs endet nächsten Freitag. Planen Sie gemeinsam ein Abschiedsgeschenk für Ihre Lehrerin: 1) Welches Geschenk (Buch, Blumen, Gutschein, Fotobuch)?, 2) Wie viel Geld sammeln wir pro Person?, 3) Wer kauft das Geschenk wann?, 4) Wer schreibt die Karte?",
    coachRole: "Ihre Kurspartnerin Elena (findet 15 € pro Person zu teuer und schlägt 5–8 € vor)",
    learnerGoal:
      "Einigen Sie sich höflich auf das Budget, wählen Sie ein passendes Geschenk aus und verteilen Sie Einkauf und Karte.",
    grammarFocus: ["Komparativ & Höflichkeit", "Relativsätze"],
    keyVocabulary: [
      "Geld einsammeln",
      "einen Gutschein besorgen",
      "alle unterschreiben auf der Karte",
      "Das ist ein guter Kompromiss",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-05",
    title: "Teil 1: Preparing an International Cooking Evening",
    titleDe: "Teil 1: Einen internationalen Kochabend organisieren",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Sie möchten mit Freunden aus Ihrem Sprachkurs einen internationalen Kochabend veranstalten: 1) Bei wem kochen wir und wann?, 2) Welche Gerichte (auch vegetarisch)?, 3) Wo kaufen wir die Zutaten ein?, 4) Musik und Getränke.",
    coachRole: "Ihr Freund David (hat eine große Küche und isst vegetarisch)",
    learnerGoal:
      "Berücksichtigen Sie vegetarische Wünsche, einigen Sie sich auf Gerichte und Einkauf und verteilen Sie die Aufgaben.",
    grammarFocus: ["Nebensätze mit damit & weil", "Adjektivendungen"],
    keyVocabulary: [
      "die Zutaten einkaufen",
      "ein vegetarisches Gericht",
      "in deiner Küche kochen",
      "die Kosten teilen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-06",
    title: "Teil 1: Renovating & Painting a Room Together",
    titleDe: "Teil 1: Gemeinsam ein WG-Zimmer streichen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Das Wohnzimmer in Ihrer WG muss neu gestrichen werden. Planen Sie den Renovierungstag: 1) Wann streichen?, 2) Welche Farbe und wer fährt zum Baumarkt?, 3) Welche Werkzeuge brauchen wir?, 4) Wie räumen wir das Zimmer vorher leer?",
    coachRole: "Ihre Mitbewohnerin Nina (möchte lieber warme, hellbeige Wände statt kräftigem Gelb)",
    learnerGoal:
      "Einigen Sie sich auf die Wandfarbe, die Einkaufsliste für den Baumarkt und den Zeitplan zum Möbelrücken.",
    grammarFocus: ["Wechselpräpositionen (an die Wand, in die Mitte)", "Modalverben"],
    keyVocabulary: [
      "im Baumarkt kaufen",
      "Farbe, Pinsel und Folie",
      "die Möbel abdecken",
      "am Samstagmorgen anfangen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-07",
    title: "Teil 1: Planning a Neighborhood Flea Market Stand",
    titleDe: "Teil 1: Einen Stand auf dem Flohmarkt planen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Sie möchten am Sonntag auf dem Flohmarkt alte Bücher, Kleidung und Haushaltssachen verkaufen: 1) Wann anmelden und Treffpunkt?, 2) Wie transportieren wir die Sachen + den Tisch?, 3) Wie legen wir die Preise fest?, 4) Wer bringt Wechselgeld und Kaffee mit?",
    coachRole: "Ihr Freund Marco (kann einen Klapptisch von seinem Nachbarn ausleihen)",
    learnerGoal:
      "Organisieren Sie Transport, Preise, Tischaufbau und eine frühe Treffzeit am Sonntagmorgen.",
    grammarFocus: ["Konjunktiv II", "Infinitiv mit zu / um...zu"],
    keyVocabulary: [
      "einen Klapptisch mitbringen",
      "Wechselgeld brauchen",
      "die Standgebühr teilen",
      "früh aufstehen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-08",
    title: "Teil 1: Creating a Weekly B1 Exam Study Group",
    titleDe: "Teil 1: Eine Lerngruppe für die B1-Prüfung gründen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Ihre Goethe-B1-Prüfung findet in 4 Wochen statt. Planen Sie eine feste Lerngruppe: 1) Wie oft und an welchen Tagen?, 2) Wo lernen (Bibliothek, Café, online)?, 3) Welche Prüfungsteile üben wir zuerst?, 4) Welche Bücher oder Modelltests nutzen wir?",
    coachRole: "Ihre Kurspartnerin Lea (arbeitet unter der Woche bis 18:00 Uhr, hat abends und samstags Zeit)",
    learnerGoal:
      "Finden Sie zwei feste Termine pro Woche und einigen Sie sich auf Lernort und Übungsmaterialien.",
    grammarFocus: ["Zeitangaben & Präpositionen", "Nebensätze mit damit"],
    keyVocabulary: [
      "zweimal pro Woche",
      "in der Stadtbibliothek",
      "Modelltests zusammen üben",
      "sich gegenseitig korrigieren",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-09",
    title: "Teil 1: Picking Up a Visitor from the Airport",
    titleDe: "Teil 1: Einen Gast vom Flughafen abholen & Wochenende planen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Ein gemeinsamer Freund aus dem Ausland kommt am Freitagabend für zwei Tage zu Besuch. Planen Sie zusammen: 1) Wie holen wir ihn vom Flughafen ab (S-Bahn oder Auto)?, 2) Welche Sehenswürdigkeiten zeigen wir am Samstag?, 3) Wo gehen wir abends essen?, 4) Programm für Sonntag.",
    coachRole: "Ihr Freund Paul (schlägt die S-Bahn vor, weil das Parken am Flughafen sehr teuer ist)",
    learnerGoal:
      "Einigen Sie sich auf die Abholung vom Flughafen und stellen Sie ein schönes Programm für beide Tage zusammen.",
    grammarFocus: ["Nebensätze mit weil / obwohl", "Konjunktiv II"],
    keyVocabulary: [
      "vom Flughafen abholen",
      "die Sehenswürdigkeiten zeigen",
      "einen Tisch reservieren",
      "eine Stadtführung machen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t1-10",
    title: "Teil 1: Doing Regular Sport Together After Work",
    titleDe: "Teil 1: Gemeinsam nach der Arbeit Sport machen",
    category: "exam_teil1_planning",
    targetLevel: "B1",
    durationMinutes: 10,
    scenarioPrompt:
      "Sie sitzen beide bei der Arbeit zu viel und möchten zweimal pro Woche zusammen Sport treiben: 1) Welche Sportart (Joggen, Schwimmen, Badminton, Fitness)?, 2) An welchen Tagen und um wie viel Uhr?, 3) Wo treffen und was kostet es?, 4) Was machen wir im Winter?",
    coachRole: "Ihre Kollegin Julia (joggt nicht gern bei Kälte, geht lieber schwimmen oder Badminton spielen)",
    learnerGoal:
      "Finden Sie eine Sportart, die Ihnen beiden Spaß macht, vereinbaren Sie feste Tage und klären Sie die Kosten.",
    grammarFocus: ["Verben mit Präpositionen (Lust haben auf)", "Komparativ"],
    keyVocabulary: [
      "sich zweimal pro Woche bewegen",
      "die Sporthalle / das Schwimmbad",
      "fit bleiben",
      "Das macht zu zweit mehr Spaß",
    ],
    source: "generated",
  },

  // =========================================================================
  // TEIL 2: EIN THEMA PRÄSENTIEREN (14 High-Frequency Goethe B1 Exam Topics)
  // =========================================================================
  {
    bankId: "spk-t2-01",
    title: "Teil 2 Presentation: Should Children Have Smartphones?",
    titleDe: "Teil 2: Sollten Kinder ein eigenes Smartphone haben?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Halten Sie eine strukturierte 3-Minuten-Präsentation (Goethe B1 Teil 2): 1) Ihre persönlichen Erfahrungen (wann Sie Ihr erstes Handy bekommen haben), 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile (Sicherheit/Kontakt vs. Ablenkung/Sucht), 4) Ihre Meinung zum Mindestalter & Abschluss.",
    coachRole: "Goethe-B1-Prüfer/in (begleitet Ihre 5 Folien und stellt 2 Rückfragen)",
    learnerGoal:
      "Gliedern Sie alle 4 Präsentationsteile klar mit Redemitteln und begründen Sie Ihr empfohlenes Mindestalter.",
    grammarFocus: ["Strukturwörter (Zuerst, Einerseits, Andererseits, Zusammenfassend)", "Nebensätze"],
    keyVocabulary: [
      "in Notfällen erreichbar sein",
      "zu viel Zeit vor dem Bildschirm",
      "feste Regeln vereinbaren",
      "Meiner Meinung nach sollten Kinder erst ab...",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-02",
    title: "Teil 2 Presentation: Online Shopping vs. Local Stores",
    titleDe: "Teil 2: Online-Shopping oder Einkaufen im Geschäft?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Online-Shopping oder Einkaufen im Geschäft?“: 1) Ihre eigenen Einkaufsgewohnheiten, 2) Die Situation in Ihrem Heimatland, 3) Vorteile (Preis/Auswahl) & Nachteile (Retouren/Verpackungsmüll/Geschäfte in der Innenstadt), 4) Ihr Fazit.",
    coachRole: "Freundliche/r Goethe-B1-Prüfer/in",
    learnerGoal:
      "Vergleichen Sie beide Einkaufsmöglichkeiten mit klaren Vor- und Nachteilen und beantworten Sie eine Rückfrage.",
    grammarFocus: ["Nebensätze mit obwohl & während", "Komparativ (bequemer als)"],
    keyVocabulary: [
      "rund um die Uhr bestellen",
      "die Kleidung anprobieren",
      "viel Verpackungsmüll",
      "die Geschäfte in der Innenstadt unterstützen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-03",
    title: "Teil 2 Presentation: Environmental Protection in Daily Life",
    titleDe: "Teil 2: Umweltschutz im Alltag — Was kann jeder tun?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Umweltschutz im Alltag“: 1) Was Sie persönlich tun (Mülltrennung, Fahrrad, Stofftaschen), 2) Mülltrennung & Umweltregeln in Ihrem Heimatland, 3) Vor- und Nachteile strenger Umweltgesetze, 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Nutzen Sie Sätze mit „um...zu“ und „damit“, um Maßnahmen für den Umweltschutz im Alltag zu erklären.",
    grammarFocus: ["damit / um...zu", "Passiv (Müll wird getrennt)"],
    keyVocabulary: [
      "Müll trennen",
      "auf Plastiktüten verzichten",
      "öffentliche Verkehrsmittel nutzen",
      "einen Beitrag zum Klimaschutz leisten",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-04",
    title: "Teil 2 Presentation: Do We Still Need Our Own Car?",
    titleDe: "Teil 2: Braucht man heute noch ein eigenes Auto?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Eigenes Auto oder öffentliche Verkehrsmittel?“: 1) Wie Sie im Alltag unterwegs sind, 2) Die Rolle von Auto, Bus und Bahn in Ihrem Heimatland, 3) Vorteile (Flexibilität, auf dem Land) & Nachteile (Kosten, Parkplatz, Abgase), 4) Ihre Meinung.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Vergleichen Sie Mobilität in der Stadt und auf dem Land und wägen Sie finanzielle sowie ökologische Argumente ab.",
    grammarFocus: ["Einerseits ... andererseits", "Nebensätze mit weil / obwohl"],
    keyVocabulary: [
      "unabhängig und flexibel sein",
      "hohe Kosten für Benzin und Versicherung",
      "im Stau stehen",
      "Carsharing und das Deutschlandticket",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-05",
    title: "Teil 2 Presentation: Cooking Yourself vs. Fast Food / Ready Meals",
    titleDe: "Teil 2: Selbst kochen oder Fertiggerichte & Fast Food?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Gesunde Ernährung & Selbst kochen“: 1) Ihre persönlichen Koch- und Essgewohnheiten, 2) Die Esskultur in Ihrem Heimatland, 3) Vor- und Nachteile von Fertiggerichten im Vergleich zu frischem Kochen, 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Halten Sie eine klar gegliederte 4-Schritte-Präsentation über Ernährung, Zeitmangel und Gesundheit.",
    grammarFocus: ["Nebensätze mit dass & weil", "Adjektivdeklination"],
    keyVocabulary: [
      "frische Zutaten verwenden",
      "wenig Zeit nach der Arbeit haben",
      "ungesund und teuer auf Dauer",
      "bewusst auf die Ernährung achten",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-06",
    title: "Teil 2 Presentation: Vacation at Home vs. Travelling Abroad",
    titleDe: "Teil 2: Urlaub im eigenen Land oder Reisen ins Ausland?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Urlaub im Heimatland oder im Ausland?“: 1) Ihre persönlichen Urlaubserfahrungen, 2) Wo die Menschen in Ihrem Heimatland meistens Urlaub machen, 3) Vor- und Nachteile von Fernreisen vs. Urlaub in der Nähe, 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Verbinden Sie persönliche Erlebnisse im Perfekt mit klaren Vor- und Nachteilen im Präsens.",
    grammarFocus: ["Perfekt & Präteritum", "Infinitiv mit zu"],
    keyVocabulary: [
      "neue Kulturen und Sprachen kennenlernen",
      "lange Flugreisen vermeiden",
      "sich vom Alltagsstress erholen",
      "das Preis-Leistungs-Verhältnis",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-07",
    title: "Teil 2 Presentation: Learning Foreign Languages Early",
    titleDe: "Teil 2: Fremdsprachen schon im Kindergarten lernen?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Fremdsprachenlernen bei Kindern“: 1) Wann und wie Sie Ihre erste Fremdsprache gelernt haben, 2) Sprachunterricht in Ihrem Heimatland, 3) Vorteile (Aussprache, spielerisches Lernen) & Nachteile (Überforderung der Kinder), 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Erzählen Sie von Ihren eigenen Erfahrungen beim Sprachenlernen und wägen Sie Vor- und Nachteile ab.",
    grammarFocus: ["Nebensätze mit als / wenn", "Komparativ (leichter als Erwachsene)"],
    keyVocabulary: [
      "spielerisch eine Sprache lernen",
      "ohne Akzent sprechen",
      "die Kinder überfordern",
      "gute Berufschancen in der Zukunft",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-08",
    title: "Teil 2 Presentation: Printed Books vs. E-Books",
    titleDe: "Teil 2: Gedruckte Bücher oder E-Books lesen?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Gedrucktes Buch oder E-Reader?“: 1) Ihre persönlichen Lesegewohnheiten, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile von E-Books gegenüber Papierbüchern, 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Vergleichen Sie beide Formate strukturiert mit passenden B1-Konnektoren und Wortschatz.",
    grammarFocus: ["Zweiteilige Konnektoren", "Relativsätze"],
    keyVocabulary: [
      "auf Reisen Platz und Gewicht sparen",
      "das Gefühl von echtem Papier",
      "die Augen schonen",
      "Hunderte Bücher auf einem Gerät",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-09",
    title: "Teil 2 Presentation: Cash vs. Card & Mobile Payment",
    titleDe: "Teil 2: Bargeld oder lieber mit Karte und Smartphone bezahlen?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Bargeld oder Kartenzahlung?“: 1) Wie Sie im Alltag am liebsten bezahlen, 2) Bezahlgewohnheiten in Ihrem Heimatland im Vergleich zu Deutschland, 3) Vorteile (Schnelligkeit, Hygiene) & Nachteile (Datenschutz, Überblick über Ausgaben), 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Vergleichen Sie das Bezahlen in Deutschland und Ihrem Heimatland und nennen Sie je 2 Vor- und Nachteile.",
    grammarFocus: ["Nebensätze mit während & weil", "Passiv"],
    keyVocabulary: [
      "kontaktlos mit dem Handy bezahlen",
      "den Überblick über die Ausgaben behalten",
      "der Datenschutz",
      "In meinem Heimatland ist es üblich, dass...",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-10",
    title: "Teil 2 Presentation: Part-Time Jobs for Students & Teenagers",
    titleDe: "Teil 2: Sollten Jugendliche und Studenten einen Nebenjob haben?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Nebenjob neben Schule oder Studium“: 1) Ihre eigenen Erfahrungen mit Nebenjobs, 2) Wie üblich Studentenjobs in Ihrem Heimatland sind, 3) Vorteile (eigenes Geld, Berufserfahrung) & Nachteile (weniger Zeit für Prüfungen), 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Stellen Sie finanzielle Selbstständigkeit und Belastung im Studium ausgewogen gegenüber.",
    grammarFocus: ["Nebensätze mit obwohl & damit", "Modalverben"],
    keyVocabulary: [
      "eigenes Geld verdienen",
      "erste Berufserfahrung sammeln",
      "weniger Zeit für das Studium",
      "Verantwortung übernehmen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-11",
    title: "Teil 2 Presentation: Pets in a City Apartment",
    titleDe: "Teil 2: Haustiere in der Stadtwohnung — Ja oder Nein?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Haustiere in der Stadtwohnung“: 1) Ihre persönlichen Erfahrungen mit Haustieren, 2) Welche Rolle Haustiere in Ihrem Heimatland spielen, 3) Vorteile (Gesellschaft, Bewegung) & Nachteile (wenig Platz, Urlaub, Tierarztkosten), 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Wägen Sie Tierwohl und Bedingungen in einer Stadtwohnung klar auf Deutsch ab.",
    grammarFocus: ["Verben mit Präpositionen (sich kümmern um)", "Konjunktiv II"],
    keyVocabulary: [
      "sich jeden Tag um das Tier kümmern",
      "nicht allein sein",
      "zu wenig Platz in der Wohnung",
      "Tierarztkosten und Urlaubsbetreuung",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t2-12",
    title: "Teil 2 Presentation: Living With Parents vs. Moving Out Early",
    titleDe: "Teil 2: Früh von zu Hause ausziehen oder bei den Eltern wohnen?",
    category: "exam_teil2_presentation",
    targetLevel: "B1",
    durationMinutes: 12,
    scenarioPrompt:
      "Präsentieren Sie das Thema „Bei den Eltern wohnen oder früh ausziehen?“: 1) Wann Sie ausgezogen sind (oder Ihre Erfahrungen), 2) Was in Ihrem Heimatland üblich ist, 3) Vorteile (Miete sparen, Unterstützung) & Nachteile (Selbstständigkeit, Hausarbeit), 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in",
    learnerGoal:
      "Vergleichen Sie kulturelle Gewohnheiten beim Auszug mit den hohen Mietpreisen in Städten.",
    grammarFocus: ["Komparativ", "Nebensätze mit weil / obwohl"],
    keyVocabulary: [
      "selbstständig werden",
      "hohe Mieten in Universitätsstädten",
      "in einer Wohngemeinschaft (WG) leben",
      "den Haushalt selbst führen",
    ],
    source: "generated",
  },

  // =========================================================================
  // TEIL 3: ÜBER EIN THEMA SPRECHEN / RÜCKMELDUNG & FRAGEN (6 Scenarios)
  // =========================================================================
  {
    bankId: "spk-t3-01",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Car-Free Sundays'",
    titleDe: "Teil 3: Rückmeldung & Fragen zum Thema „Autofreier Sonntag“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Ihr Prüfungspartner hat gerade eine Präsentation über „Autofreie Sonntage in der Innenstadt“ gehalten. 1) Geben Sie höfliche Rückmeldung zur Präsentation, 2) Stellen Sie 2 passende Anschlussfragen, 3) Beantworten Sie die Fragen Ihres Partners zum Verkehr in Ihrer Stadt.",
    coachRole: "Ihr Prüfungspartner (hat gerade über das Thema „Autofreier Sonntag“ präsentiert)",
    learnerGoal:
      "Nutzen Sie typische Redemittel für Goethe Teil 3 (Lob + Rückmeldung) und stellen Sie zwei offene Fragen.",
    grammarFocus: ["Indirekte Fragen (Mich würde interessieren, ob...)", "Präteritum (fand)"],
    keyVocabulary: [
      "Deine Präsentation hat mir sehr gut gefallen",
      "Besonders interessant fand ich den Punkt über...",
      "Ich hätte noch eine Frage dazu:",
      "Wie siehst du das bei Pendlern?",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t3-02",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Extreme Sports'",
    titleDe: "Teil 3: Rückmeldung & Diskussion über „Extremsportarten“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Reagieren Sie auf die Präsentation Ihres Partners über „Extremsportarten (Klettern, Fallschirmspringen)“: Geben Sie eine kurze Rückmeldung, fragen Sie nach Risiken und Versicherung und erzählen Sie, welche Sportarten Sie bevorzugen.",
    coachRole: "Ihr Prüfungspartner (begeisterter Bergsteiger und Kletterer)",
    learnerGoal:
      "Geben Sie strukturiertes Feedback, stellen Sie 2 gezielte Fragen und erklären Sie Ihre eigene Haltung zu Risikosport.",
    grammarFocus: ["Verben mit Präpositionen (Angst haben vor)", "Konjunktiv II"],
    keyVocabulary: [
      "Du hast das Thema sehr klar strukturiert",
      "Findest du nicht, dass das Risiko zu hoch ist?",
      "Für mich persönlich wäre das zu gefährlich",
      "Ich bevorzuge sichere Sportarten wie...",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t3-03",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Four-Day Work Week'",
    titleDe: "Teil 3: Rückmeldung & Fragen zur „Vier-Tage-Woche“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Reagieren Sie auf die Präsentation Ihres Partners über die „Vier-Tage-Woche“: Loben Sie die Beispiele, fragen Sie nach der Belastung durch 10-Stunden-Arbeitstage und sprechen Sie über Ihre idealen Arbeitszeiten.",
    coachRole: "Ihr Prüfungspartner (befürwortet die Vier-Tage-Woche)",
    learnerGoal:
      "Führen Sie ein natürliches Anschlussgespräch mit Meinungsäußerungen auf B1-Niveau.",
    grammarFocus: ["Nebensätze mit ob & weil", "Konjunktiv II (ich würde lieber)"],
    keyVocabulary: [
      "Vielen Dank für deinen spannenden Vortrag",
      "Glaubst du, dass das in jedem Beruf funktioniert?",
      "Ein langes Wochenende ist zwar schön, aber...",
      "die Produktivität am Arbeitsplatz",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t3-04",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Social Media Influencers'",
    titleDe: "Teil 3: Rückmeldung & Fragen zu „Influencer und Werbung“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Reagieren Sie auf die Präsentation Ihres Partners über „Influencer und Werbung in sozialen Medien“: Geben Sie Rückmeldung, fragen Sie, wie Jugendliche versteckte Werbung erkennen können, und berichten Sie von eigenen Erfahrungen.",
    coachRole: "Ihr Prüfungspartner (hat über Werbung in sozialen Medien gesprochen)",
    learnerGoal:
      "Loben Sie den Vortrag, stellen Sie 2 offene Fragen und antworten Sie spontan auf Gegenfragen.",
    grammarFocus: ["Relativsätze", "Perfekt im Gespräch"],
    keyVocabulary: [
      "Dein Beispiel aus deinem Heimatland war sehr anschaulich",
      "Hast du selbst schon einmal etwas wegen Werbung gekauft?",
      "Man sollte kritisch prüfen, ob...",
      "versteckte Werbung erkennen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t3-05",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Shared Apartments (WG)'",
    titleDe: "Teil 3: Rückmeldung & Fragen zum Thema „Leben in einer WG“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Reagieren Sie auf die Präsentation Ihres Partners über das „Leben in einer Wohngemeinschaft (WG)“: Loben Sie die genannten Argumente, fragen Sie nach Lösungen bei Streit über den Putzplan und nennen Sie Ihre eigene Wohnpräferenz.",
    coachRole: "Ihr Prüfungspartner (hat selbst in einer 4er-Studenten-WG gewohnt)",
    learnerGoal:
      "Reagieren Sie natürlich, stellen Sie Anschlussfragen zur Konfliktlösung und begründen Sie Ihre eigene Meinung.",
    grammarFocus: ["Nebensätze mit wenn & weil", "Infinitiv mit zu"],
    keyVocabulary: [
      "Du hast die Vor- und Nachteile sehr gut verglichen",
      "Wie habt ihr Probleme mit dem Putzplan gelöst?",
      "Mir ist meine Ruhe zu Hause sehr wichtig",
      "die Miete teilen",
    ],
    source: "generated",
  },
  {
    bankId: "spk-t3-06",
    title: "Teil 3 Feedback & Q&A: Partner's Talk on 'Learning with AI Apps'",
    titleDe: "Teil 3: Rückmeldung & Fragen zu „Sprachen lernen mit KI“",
    category: "exam_teil3_discussion",
    targetLevel: "B1",
    durationMinutes: 8,
    scenarioPrompt:
      "Reagieren Sie auf die Präsentation Ihres Partners über „Sprachen lernen mit KI-Apps vs. Sprachkurs“: Geben Sie höfliche Rückmeldung, stellen Sie eine Frage zum Thema Sprechangst und erzählen Sie, wie Sie selbst Deutsch üben.",
    coachRole: "Ihr Prüfungspartner (hat über digitales Sprachenlernen präsentiert)",
    learnerGoal:
      "Verbinden Sie konkretes Lob, offene Anschlussfragen und eigene Erfahrungen flüssig auf Deutsch.",
    grammarFocus: ["damit / um...zu", "Komparativ"],
    keyVocabulary: [
      "Ich stimme dir absolut zu, dass...",
      "Kann eine App deiner Meinung nach einen echten Lehrer ersetzen?",
      "ohne Angst vor Fehlern sprechen üben",
      "jeden Tag flexibel trainieren",
    ],
    source: "generated",
  },
];

const CURATED_GERMAN_OVERRIDES: Record<
  string,
  { scenarioPrompt: string; coachRole: string; learnerGoal: string }
> = {
  "teil 1: gemeinsam eine abschiedsparty planen": {
    scenarioPrompt:
      "Ein Kollege aus Ihrem Deutschkurs zieht zurück in sein Heimatland. Planen Sie gemeinsam eine Überraschungs-Abschiedsparty: 1) Wann und um wie viel Uhr?, 2) Wo feiern wir?, 3) Wer kümmert sich um Essen und Getränke?, 4) Welches Abschiedsgeschenk kaufen wir?",
    coachRole:
      "Ihr Kursteilnehmer aus dem Deutschkurs (freundlich, hat eigene Gegenvorschläge, damit Sie verhandeln)",
    learnerGoal:
      "Besprechen Sie alle 4 Leitpunkte, machen Sie höfliche Vorschläge im Konjunktiv II und einigen Sie sich am Ende auf einen klaren Plan.",
  },
  "teil 2 präsentation: arbeiten im homeoffice": {
    scenarioPrompt:
      "Halten Sie eine strukturierte 3-Minuten-Präsentation zum Thema „Arbeiten im Homeoffice“: 1) Ihre persönlichen Erfahrungen, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile, 4) Ihre persönliche Meinung und Abschluss.",
    coachRole:
      "Freundliche/r Goethe-B1-Prüfer/in (begleitet Sie durch die Präsentationsteile und stellt Rückfragen)",
    learnerGoal:
      "Verbinden Sie alle 4 Präsentationsteile mit klaren Redemitteln und nennen Sie mindestens 2 Vorteile und 2 Nachteile.",
  },
  "teil 3: rückmeldung geben & fragen beantworten": {
    scenarioPrompt:
      "Ihr Gesprächspartner hält eine kurze Präsentation zum Thema „Umweltschutz im Alltag“. Geben Sie eine höfliche Rückmeldung, stellen Sie 2 Anschlussfragen und beantworten Sie die Gegenfragen zu Ihren eigenen Gewohnheiten.",
    coachRole:
      "Ihr Prüfungspartner (präsentiert über Umweltschutz im Alltag und stellt Ihnen Rückfragen)",
    learnerGoal:
      "Reagieren Sie spontan auf gesprochenes Deutsch, loben Sie einen konkreten Punkt und stellen Sie offene Fragen.",
  },
  "teil 1: einen kranken freund im krankenhaus besuchen": {
    scenarioPrompt:
      "Ein gemeinsamer Freund hat sich das Bein gebrochen und liegt im Krankenhaus. Planen Sie gemeinsam Ihren Besuch: 1) Wann besuchen wir ihn?, 2) Wie fahren wir zum Krankenhaus?, 3) Was bringen wir ihm mit?, 4) Wie können wir ihm danach zu Hause helfen?",
    coachRole:
      "Ihr Freund (arbeitet bis 17:00 Uhr und fährt lieber mit der Bahn)",
    learnerGoal:
      "Lösen Sie das Zeitproblem höflich und einigen Sie sich bei allen 4 Punkten auf eine gemeinsame Lösung.",
  },
  "teil 2: wohnen in der großstadt oder auf dem land": {
    scenarioPrompt:
      "Vergleichen Sie das Leben in der Großstadt mit dem Leben auf dem Land: 1) Ihre eigenen Erfahrungen (wo Sie aufgewachsen sind), 2) Situation in Ihrem Heimatland, 3) Vor- und Nachteile (Mieten, Lärm, Verkehr, Natur), 4) Wo Sie selbst lieber wohnen.",
    coachRole:
      "Goethe-B1-Prüfer/in (fragt nach genaueren Gründen und Vergleichen)",
    learnerGoal:
      "Nutzen Sie Komparativ-Formen und Nebensätze mit „obwohl“ und „während“ sicher beim Sprechen.",
  },
  "hören & reagieren: probleme im alltag lösen": {
    scenarioPrompt:
      "Trainieren Sie spontanes Hörverstehen und Reagieren (Tipp: Blind-Listening-Modus testen!): Der Coach spielt 3 Alltagssituationen durch (Zugverspätung, falsche Lieferung, lauter Nachbar) und Sie reagieren sofort auf Deutsch.",
    coachRole:
      "Zugbegleiter, Kundenservice-Mitarbeiter und Nachbar in drei kurzen Rollenspielen",
    learnerGoal:
      "Verstehen Sie das gesprochene Problem sofort und reagieren Sie höflich, klar und lösungsorientiert.",
  },
  "wohnen in der großstadt oder auf dem land": {
    scenarioPrompt:
      "Präsentieren Sie das Thema „Wohnen in der Großstadt oder auf dem Land“: 1) Ihre persönlichen Erfahrungen, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile beider Wohnformen, 4) Ihre Meinung und Abschluss.",
    coachRole: "Goethe-B1-Prüfer/in und Gesprächspartner/in",
    learnerGoal:
      "Stellen Sie Ihre Erfahrungen sowie Vor- und Nachteile klar dar und beantworten Sie Anschlussfragen auf Deutsch.",
  },
  "online-shopping vs. einkaufen im geschäft": {
    scenarioPrompt:
      "Präsentieren Sie das Thema „Online-Shopping oder Einkaufen im Geschäft?“: 1) Ihre eigenen Erfahrungen, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile, 4) Ihre persönliche Meinung.",
    coachRole: "Goethe-B1-Prüfer/in und Gesprächspartner/in",
    learnerGoal:
      "Begründen Sie Ihre Meinung mit mindestens 2 Vorteilen und 2 Nachteilen und beantworten Sie Rückfragen auf Deutsch.",
  },
  "homeoffice vs. arbeit im büro": {
    scenarioPrompt:
      "Präsentieren Sie das Thema „Arbeiten im Homeoffice oder im Büro?“: 1) Ihre persönlichen Erfahrungen, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile, 4) Ihr Fazit.",
    coachRole: "Goethe-B1-Prüfer/in und Gesprächspartner/in",
    learnerGoal:
      "Stellen Sie Ihre Erfahrungen sowie Vor- und Nachteile klar dar und beantworten Sie Rückfragen auf Deutsch.",
  },
  "vor- und nachteile nennen und höfliche vorschläge machen": {
    scenarioPrompt:
      "Sie und Ihr Prüfungspartner planen eine Überraschungsparty für einen Kollegen. Üben Sie höfliche Vorschläge mit „wir könnten...“ und „ich würde vorschlagen, dass...“ sowie klare Sätze für Vor- und Nachteile („Ein großer Vorteil ist, dass...“).",
    coachRole:
      "Ihr Goethe-B1-Prüfungspartner (bittet Sie um Vorschläge und fragt nach Vor- und Nachteilen)",
    learnerGoal:
      "Formulieren Sie mindestens drei Vorschläge im Konjunktiv II und nennen Sie Vor- und Nachteile mit korrekter Verbposition am Ende.",
  },
  "nebensätze mit weil/dass und modalverben richtig nutzen": {
    scenarioPrompt:
      "Sprechen Sie mit Ihrem Partner über Ihren Alltag, Ihre Wochenendpläne und Ihre Hobbys. Achten Sie besonders auf das Verb am Ende nach „weil“ und „dass“ sowie auf den Unterschied zwischen „können“ und „kennen“.",
    coachRole:
      "Freundlicher deutscher Gesprächspartner (fragt nach Ihren Wochenendplänen und Gründen für Ihre Hobbys)",
    learnerGoal:
      "Bilden Sie fehlerfreie Nebensätze mit „weil“ und „dass“ (Verb am Ende) und verwenden Sie „können“ und „kennen“ sicher.",
  },
  "gemeinsame reise planen mit konjunktiv ii": {
    scenarioPrompt:
      "Sie und Ihr Gesprächspartner planen einen Wochenendausflug in die Berge. Machen Sie höfliche Vorschläge mit „wir könnten...“ und „ich würde vorschlagen, dass...“ und achten Sie auf Modalverben sowie das Verb am Ende im Nebensatz.",
    coachRole:
      "Freundlicher Kollege, der mit Ihnen den Wochenendausflug plant",
    learnerGoal:
      "Machen Sie mindestens 3 Vorschläge im Konjunktiv II und achten Sie auf korrekte Wortstellung im Nebensatz.",
  },
  "vor- und nachteile von social media": {
    scenarioPrompt:
      "Halten Sie Ihre Kurzpräsentation zum Thema „Soziale Medien“. Strukturieren Sie Ihre Vor- und Nachteile klar („Ein wesentlicher Vorteil ist, dass...“, „Ein Nachteil besteht darin, dass...“) und beantworten Sie eine Rückfrage mit korrektem Nebensatz.",
    coachRole:
      "Aufmerksame/r Goethe-B1-Prüfer/in (hört Ihrer Präsentation zu und stellt eine spontane Anschlussfrage)",
    learnerGoal:
      "Präsentieren Sie Vor- und Nachteile mit sauberem Satzbau und beantworten Sie die Anschlussfrage mit „weil“ oder „dass“.",
  },
};

export function localizeSpeakingModuleToGerman(mod: StudyModule): {
  scenarioPrompt: string;
  coachRole: string;
  learnerGoal: string;
} {
  const keyDe = mod.titleDe.toLowerCase().trim();
  const keyEn = mod.title.toLowerCase().trim();

  const bankMatch = GOETHE_SPEAKING_BANK.find(
    (b) =>
      b.titleDe.toLowerCase().trim() === keyDe ||
      b.title.toLowerCase().trim() === keyEn
  );
  if (bankMatch) {
    return {
      scenarioPrompt: bankMatch.scenarioPrompt,
      coachRole: bankMatch.coachRole,
      learnerGoal: bankMatch.learnerGoal,
    };
  }

  const override =
    CURATED_GERMAN_OVERRIDES[keyDe] ?? CURATED_GERMAN_OVERRIDES[keyEn];
  if (override) {
    return override;
  }

  return {
    scenarioPrompt: mod.scenarioPrompt,
    coachRole: mod.coachRole,
    learnerGoal: mod.learnerGoal,
  };
}

export function filterAvailableSpeakingBank(
  existingModules: StudyModule[],
  categoryFilter?: ModuleCategory | "all",
  levelFilter?: CefrLevel | "all"
): SpeakingBankItem[] {
  const existingTitlesDe = new Set(
    existingModules.map((m) => m.titleDe.toLowerCase().trim())
  );
  const existingTitlesEn = new Set(
    existingModules.map((m) => m.title.toLowerCase().trim())
  );

  return GOETHE_SPEAKING_BANK.filter((item) => {
    if (
      existingTitlesDe.has(item.titleDe.toLowerCase().trim()) ||
      existingTitlesEn.has(item.title.toLowerCase().trim())
    ) {
      return false;
    }
    if (
      categoryFilter &&
      categoryFilter !== "all" &&
      item.category !== categoryFilter
    ) {
      return false;
    }
    if (
      levelFilter &&
      levelFilter !== "all" &&
      item.targetLevel !== levelFilter
    ) {
      return false;
    }
    return true;
  });
}
