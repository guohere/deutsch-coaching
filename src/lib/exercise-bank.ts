import { EXTRA_MODEL_TEST_EXERCISES } from "./model-tests-bank";
import { SkillDrillExercise } from "./types";

/**
 * Curated, human-verified German exam exercises modeled after the exact official
 * Goethe-Zertifikat B1 examination structure (zero LLM hallucination):
 * - HÖREN (40 Min · 30 Aufgaben):
 *   • Teil 1: 5 kurze Texte · 10 Aufgaben (je Text 1× Richtig/Falsch + 1× a/b/c) · 2× hören
 *   • Teil 2: 1 längerer Vortrag / Führung · 5 Aufgaben (a/b/c) · NUR 1× hören!
 *   • Teil 3: 1 Alltagsgespräch (2 Personen) · 7 Aufgaben (Richtig/Falsch) · NUR 1× hören!
 *   • Teil 4: Radiodiskussion (3 Personen) · 8 Aufgaben (Wer sagt was? a/b/c) · 2× hören
 * - LESEN (65 Min · 30 Aufgaben):
 *   • Teil 1: Blog / E-Mail · 6 Aufgaben (Richtig/Falsch)
 *   • Teil 2: 2 Presseartikel · 6 Aufgaben (je 3× a/b/c)
 *   • Teil 3: Situatives Lesen (Anzeigen A–H / 0 zuordnen) · 7 Aufgaben
 *   • Teil 4: 7 Lesermeinungen / Forum · 7 Aufgaben (Ja / Nein)
 *   • Teil 5: Hausordnung / Offizielle Regeln · 4 Aufgaben (a/b/c)
 * - SCHREIBEN (60 Min · 3 Aufgaben · 100 Punkte):
 *   • Aufgabe 1: Informelle E-Mail („du“-Form, 3 Leitpunkte, ~80 Wörter, 20 Min., 40 Pkt.)
 *   • Aufgabe 2: Diskussionsbeitrag im Online-Gästebuch (~80 Wörter, 25 Min., 40 Pkt.)
 *   • Aufgabe 3: Formelle Kurzmitteilung („Sie“-Form, ~40 Wörter, 15 Min., 20 Pkt.)
 */
const BASE_VERIFIED_EXERCISES: SkillDrillExercise[] = [
  // =========================================================================
  // HÖREN · OFFICIAL GOETHE B1 FULL PART SETS (TEIL 1, TEIL 2, TEIL 3, TEIL 4)
  // =========================================================================
  {
    id: "bank-hoeren-b1-official-teil1-01",
    skill: "hoeren",
    level: "B1",
    topicDe: "Alltag, Reisen, Termine & Service",
    topicEn: "Everyday Announcements, Voicemails & Radio",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-nebensatz",
    title: "Offizieller Modelltest — Hören Teil 1 (5 Kurztexte · Nr. 1–10)",
    examPartNumber: 1,
    examPartLabel: "Hören · Teil 1 (Komplett · 10 Aufgaben)",
    officialFormatBadge: "5 Kurztexte · 10 Aufgaben (R/F + a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 33,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Teil 1): Sie hören fünf kurze Texte. Sie hören jeden Text zweimal (2×). Wählen Sie für die Aufgaben 1 bis 10 die richtige Lösung (pro Text zuerst Richtig/Falsch, danach a, b oder c).",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Text eins. Guten Tag, Herr Yilmaz, hier ist die Zahnarztpraxis Doktor Lindner. Sie haben morgen, am Mittwoch, eigentlich um vierzehn Uhr einen Termin zur Zahnreinigung. Leider ist unsere Mitarbeiterin kurzfristig erkrankt. Könnten Sie stattdessen am Freitag um elf Uhr dreißig kommen? Falls Sie am Freitag verhindert sind, rufen Sie uns bitte heute noch bis achtzehn Uhr zurück. " +
      "Text zwei. Achtung am Gleis vier: Eine Durchsage für die Fahrgäste des ICE fünfhundertachtzehn nach Stuttgart über Mannheim. Wegen einer Weichenstörung fährt der Zug heute mit etwa zwanzig Minuten Verspätung ab. Bitte beachten Sie außerdem, dass die Erste-Klasse-Wagen heute am Ende des Zuges im Sektor D halten. Das Bordrestaurant ist geöffnet. " +
      "Text drei. Und hier noch ein Veranstaltungstipp im Lokalradio: Am kommenden Sonntag findet im Botanischen Garten wieder das jährliche Herbstfest statt. Von zehn bis siebzehn Uhr gibt es Führungen zu seltenen Bäumen und einen großen Bauernmarkt. Für Erwachsene kostet der Eintritt vier Euro, Kinder unter vierzehn Jahren haben freien Eintritt. Da die Parkplätze direkt am Garten gesperrt sind, nutzen Sie bitte die Straßenbahnlinie sechs. " +
      "Text vier. Hallo Nina, hier ist Svenja. Unser Kundengespräch mit der Firma Bergmann morgen früh um neun Uhr findet nicht im großen Konferenzraum statt, weil dort der Projektor repariert wird. Wir treffen uns stattdessen im Besprechungszimmer im dritten Stock. Ich habe die Verträge schon ausgedruckt, aber könntest du bitte noch deinen Laptop und das aktuelle Protokoll mitbringen? Danke dir! " +
      "Text fünf. Willkommen beim Kundenservice von Möbel Nord. Ihre Bestellung, das Bücherregal Oslo, ist heute in unserem Lager eingetroffen. Unser Lieferdienst bringt das Regal am Donnerstag zwischen dreizehn und sechzehn Uhr zu Ihnen nach Hause. Falls Sie die alte Kommode gleich kostenlos mitgeben möchten, stellen Sie diese bitte schon abgebaut in den Flur.",
    sections: [
      {
        id: "t1",
        label: "Text 1 (Zu Aufgaben 1 & 2)",
        title: "Nachricht auf dem Anrufbeantworter (Zahnarztpraxis)",
        speakerRole: "Praxis Dr. Lindner",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Guten Tag, Herr Yilmaz, hier ist die Zahnarztpraxis Doktor Lindner. Sie haben morgen, am Mittwoch, eigentlich um vierzehn Uhr einen Termin zur Zahnreinigung. Leider ist unsere Mitarbeiterin kurzfristig erkrankt. Könnten Sie stattdessen am Freitag um elf Uhr dreißig kommen? Falls Sie am Freitag verhindert sind, rufen Sie uns bitte heute noch bis achtzehn Uhr zurück.",
      },
      {
        id: "t2",
        label: "Text 2 (Zu Aufgaben 3 & 4)",
        title: "Durchsage am Bahnhof (ICE 518)",
        speakerRole: "Bahnhofsdurchsage",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Achtung am Gleis vier: Eine Durchsage für die Fahrgäste des ICE fünfhundertachtzehn nach Stuttgart über Mannheim. Wegen einer Weichenstörung fährt der Zug heute mit etwa zwanzig Minuten Verspätung ab. Bitte beachten Sie außerdem, dass die Erste-Klasse-Wagen heute am Ende des Zuges im Sektor D halten. Das Bordrestaurant ist geöffnet.",
      },
      {
        id: "t3",
        label: "Text 3 (Zu Aufgaben 5 & 6)",
        title: "Veranstaltungstipp im Lokalradio",
        speakerRole: "Radiomoderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Und hier noch ein Veranstaltungstipp im Lokalradio: Am kommenden Sonntag findet im Botanischen Garten wieder das jährliche Herbstfest statt. Von zehn bis siebzehn Uhr gibt es Führungen zu seltenen Bäumen und einen großen Bauernmarkt. Für Erwachsene kostet der Eintritt vier Euro, Kinder unter vierzehn Jahren haben freien Eintritt. Da die Parkplätze direkt am Garten gesperrt sind, nutzen Sie bitte die Straßenbahnlinie sechs.",
      },
      {
        id: "t4",
        label: "Text 4 (Zu Aufgaben 7 & 8)",
        title: "Sprachnachricht von Kollegin Svenja",
        speakerRole: "Kollegin Svenja",
        edgeVoice: "de-DE-AmalaNeural",
        textDe:
          "Hallo Nina, hier ist Svenja. Unser Kundengespräch mit der Firma Bergmann morgen früh um neun Uhr findet nicht im großen Konferenzraum statt, weil dort der Projektor repariert wird. Wir treffen uns stattdessen im Besprechungszimmer im dritten Stock. Ich habe die Verträge schon ausgedruckt, aber könntest du bitte noch deinen Laptop und das aktuelle Protokoll mitbringen? Danke dir!",
      },
      {
        id: "t5",
        label: "Text 5 (Zu Aufgaben 9 & 10)",
        title: "Telefonansage vom Möbelhaus-Lieferdienst",
        speakerRole: "Kundenservice Möbel Nord",
        edgeVoice: "de-DE-KillianNeural",
        textDe:
          "Willkommen beim Kundenservice von Möbel Nord. Ihre Bestellung, das Bücherregal Oslo, ist heute in unserem Lager eingetroffen. Unser Lieferdienst bringt das Regal am Donnerstag zwischen dreizehn und sechzehn Uhr zu Ihnen nach Hause. Falls Sie die alte Kommode gleich kostenlos mitgeben möchten, stellen Sie diese bitte schon abgebaut in den Flur.",
      },
    ],
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        sectionLabel: "Text 1",
        questionType: "richtig_falsch",
        questionDe: "Der Termin von Herrn Yilmaz am Mittwoch findet wie geplant statt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Die Mitarbeiterin ist erkrankt, deshalb wird ihm stattdessen ein neuer Termin am Freitag vorgeschlagen.",
      },
      {
        id: "q2",
        itemNumber: 2,
        sectionLabel: "Text 1",
        questionType: "mcq",
        questionDe: "Wann soll Herr Yilmaz in der Praxis anrufen?",
        options: [
          "Nur wenn er am Freitag um 11:30 Uhr keine Zeit hat.",
          "Erst am Freitagmorgen vor elf Uhr.",
          "Sofort morgen früh um vierzehn Uhr.",
        ],
        correctIndex: 0,
        explanation:
          "„Falls Sie am Freitag verhindert sind, rufen Sie uns bitte heute noch bis achtzehn Uhr zurück.“",
      },
      {
        id: "q3",
        itemNumber: 3,
        sectionLabel: "Text 2",
        questionType: "richtig_falsch",
        questionDe: "Der ICE 518 nach Stuttgart fährt heute pünktlich ab.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Wegen einer Weichenstörung fährt der Zug heute mit etwa zwanzig Minuten Verspätung ab.“",
      },
      {
        id: "q4",
        itemNumber: 4,
        sectionLabel: "Text 2",
        questionType: "mcq",
        questionDe: "Was hat sich beim ICE 518 heute geändert?",
        options: [
          "Das Bordrestaurant ist heute geschlossen.",
          "Der Zug hält heute nicht in Mannheim.",
          "Die Wagen der ersten Klasse halten am Ende des Zuges im Sektor D.",
        ],
        correctIndex: 2,
        explanation:
          "„Bitte beachten Sie außerdem, dass die Erste-Klasse-Wagen heute am Ende des Zuges im Sektor D halten.“",
      },
      {
        id: "q5",
        itemNumber: 5,
        sectionLabel: "Text 3",
        questionType: "richtig_falsch",
        questionDe: "Kinder unter 14 Jahren müssen beim Herbstfest keinen Eintritt bezahlen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Kinder unter vierzehn Jahren haben freien Eintritt.“",
      },
      {
        id: "q6",
        itemNumber: 6,
        sectionLabel: "Text 3",
        questionType: "mcq",
        questionDe: "Wie sollen die Besucher zum Botanischen Garten fahren?",
        options: [
          "Mit dem eigenen Auto bis zum Haupteingang.",
          "Mit der Straßenbahnlinie 6, weil die Parkplätze gesperrt sind.",
          "Mit dem kostenlosen Bus vom Bahnhof.",
        ],
        correctIndex: 1,
        explanation:
          "„Da die Parkplätze direkt am Garten gesperrt sind, nutzen Sie bitte die Straßenbahnlinie sechs.“",
      },
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Text 4",
        questionType: "richtig_falsch",
        questionDe: "Das Kundengespräch wurde auf nächste Woche verschoben.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Das Gespräch findet morgen früh um 9 Uhr statt, nur der Raum ändert sich (Besprechungszimmer im 3. Stock).",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Text 4",
        questionType: "mcq",
        questionDe: "Was soll Nina zum Gespräch mitbringen?",
        options: [
          "Die ausgedruckten Verträge.",
          "Einen neuen Projektor.",
          "Ihren Laptop und das aktuelle Protokoll.",
        ],
        correctIndex: 2,
        explanation:
          "Svenja hat die Verträge schon ausgedruckt und bittet Nina: „könntest du bitte noch deinen Laptop und das aktuelle Protokoll mitbringen?“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Text 5",
        questionType: "richtig_falsch",
        questionDe: "Das bestellte Bücherregal wird am Donnerstagvormittag geliefert.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Die Lieferung erfolgt am Donnerstagnachmittag „zwischen dreizehn und sechzehn Uhr“.",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Text 5",
        questionType: "mcq",
        questionDe: "Was muss der Kunde tun, wenn der Lieferdienst die alte Kommode mitnehmen soll?",
        options: [
          "Er muss 25 Euro extra bezahlen.",
          "Er muss die Kommode vorher abbauen und in den Flur stellen.",
          "Er muss die Kommode selbst zum Lager bringen.",
        ],
        correctIndex: 1,
        explanation:
          "„Falls Sie die alte Kommode gleich kostenlos mitgeben möchten, stellen Sie diese bitte schon abgebaut in den Flur.“",
      },
    ],
    keyVocab: [
      { german: "kurzfristig erkrankt", meaning: "fallen ill at short notice" },
      { german: "verhindert sein", meaning: "to be unable to attend / tied up" },
      { german: "die Weichenstörung", meaning: "track switch malfunction" },
      { german: "das Protokoll", meaning: "meeting minutes" },
    ],
  },

  {
    id: "bank-hoeren-b1-official-teil2-01",
    skill: "hoeren",
    level: "B1",
    topicDe: "Freizeit, Kultur & Umwelt",
    topicEn: "Guided Museum & Science Center Tour",
    vocabCategoryId: "voc-leisure",
    grammarStandardId: "gram-passiv",
    title: "Offizieller Modelltest — Hören Teil 2 (Museumsführung · Nr. 11–15)",
    examPartNumber: 2,
    examPartLabel: "Hören · Teil 2 (Komplett · 5 Aufgaben)",
    officialFormatBadge: "1 Vortrag · 5 Aufgaben (a/b/c) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 17,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Teil 2): Sie hören einen längeren Vortrag zur Begrüßung im Deutschen Umwelt- und Technikmuseum. Achtung: In der echten Prüfung hören Sie diesen Text NUR EINMAL (1×)! Lesen Sie zuerst die Aufgaben 11–15.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Herzlich willkommen, meine Damen und Herren, zu unserer Führung durch das neue Umwelt- und Technikmuseum! Mein Name ist Martin Förster, und ich begleite Sie heute durch unsere drei Ausstellungsetagen. Bevor wir starten, ein kurzer Blick auf die Geschichte unseres Hauses: Das Backsteingebäude, in dem wir gerade stehen, wurde nicht etwa als Museum gebaut, sondern diente fast achtzig Jahre lang als städtisches Wasserwerk, bevor es nach einer gründlichen Sanierung vor drei Jahren als Museum eröffnet wurde. " +
      "Unser Rundgang beginnt gleich im Erdgeschoss mit dem Thema Mobilität der Zukunft. Dort dürfen Sie die historischen Fahrzeuge bitte nicht berühren, aber im neuen Fahrsimulator können Sie selbst ausprobieren, wie sich ein solarbetriebenes Stadtauto steuern lässt. " +
      "Danach gehen wir in den ersten Stock zur Ausstellung über erneuerbare Energien. Besonders für Familien mit Kindern lohnt sich dort das Mitmach-Labor: Ab vierzehn Uhr zeigen unsere Wissenschaftler, wie man aus einfachem Haushaltsmüll Strom erzeugen kann. " +
      "Falls Sie zwischendurch fotografieren möchten: Das ist in allen Räumen für private Zwecke erlaubt, solange Sie keinen Blitz verwenden, da das grelle Licht die alten Dokumente im zweiten Stock beschädigt. " +
      "Unser Rundgang dauert insgesamt rund fünfzig Minuten und endet auf der Dachterrasse neben dem Museumscafé. Dort oben erhalten Sie gegen Vorlage Ihrer Eintrittskarte ein kostenloses Glas Apfelschorle aus regionalem Anbau. Haben Sie vorab noch Fragen?",
    questions: [
      {
        id: "q11",
        itemNumber: 11,
        questionType: "mcq",
        questionDe: "Wofür wurde das Museumsgebäude früher genutzt?",
        options: [
          "Als Bahnhof für historische Züge.",
          "Als städtisches Wasserwerk.",
          "Als Fabrik für Solarautos.",
        ],
        correctIndex: 1,
        explanation:
          "Herr Förster erklärt: „Das Backsteingebäude ... diente fast achtzig Jahre lang als städtisches Wasserwerk.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        questionType: "mcq",
        questionDe: "Was können die Besucher im Erdgeschoss selbst aktiv ausprobieren?",
        options: [
          "Einen Fahrsimulator für ein solarbetriebenes Stadtauto.",
          "In die historischen Fahrzeuge einzusteigen.",
          "Einen eigenen kleinen Motor zu reparieren.",
        ],
        correctIndex: 0,
        explanation:
          "Die historischen Fahrzeuge darf man nicht berühren, „aber im neuen Fahrsimulator können Sie selbst ausprobieren, wie sich ein solarbetriebenes Stadtauto steuern lässt.“",
      },
      {
        id: "q13",
        itemNumber: 13,
        questionType: "mcq",
        questionDe: "Was wird ab 14 Uhr im Mitmach-Labor im ersten Stock gezeigt?",
        options: [
          "Wie man alte Batterien richtig entsorgt.",
          "Wie man Solarzellen auf dem eigenen Balkon montiert.",
          "Wie man aus Haushaltsmüll Strom erzeugen kann.",
        ],
        correctIndex: 2,
        explanation:
          "„Ab vierzehn Uhr zeigen unsere Wissenschaftler, wie man aus einfachem Haushaltsmüll Strom erzeugen kann.“",
      },
      {
        id: "q14",
        itemNumber: 14,
        questionType: "mcq",
        questionDe: "Welche Regel gilt für das Fotografieren im Museum?",
        options: [
          "Fotografieren ist im gesamten Museum streng verboten.",
          "Man darf für private Zwecke ohne Blitz fotografieren.",
          "Man muss an der Kasse eine Foto-Erlaubnis für 5 Euro kaufen.",
        ],
        correctIndex: 1,
        explanation:
          "„Das ist in allen Räumen für private Zwecke erlaubt, solange Sie keinen Blitz verwenden...“",
      },
      {
        id: "q15",
        itemNumber: 15,
        questionType: "mcq",
        questionDe: "Was bekommen die Teilnehmer am Ende der Führung auf der Dachterrasse?",
        options: [
          "Ein kostenloses Glas regionale Apfelschorle mit ihrer Eintrittskarte.",
          "Einen Gutschein für den Museumsshop.",
          "Ein gedrucktes Buch über die Geschichte des Hauses.",
        ],
        correctIndex: 0,
        explanation:
          "„Dort oben erhalten Sie gegen Vorlage Ihrer Eintrittskarte ein kostenloses Glas Apfelschorle aus regionalem Anbau.“",
      },
    ],
    keyVocab: [
      { german: "die Führung / der Rundgang", meaning: "guided tour" },
      { german: "die Sanierung", meaning: "renovation / refurbishment" },
      { german: "erneuerbare Energien", meaning: "renewable energy" },
      { german: "gegen Vorlage (+ Genitiv)", meaning: "upon presentation of" },
    ],
  },

  {
    id: "bank-hoeren-b1-official-teil3-01",
    skill: "hoeren",
    level: "B1",
    topicDe: "Wohnen, Alltag & Nachbarschaft",
    topicEn: "Everyday 2-Person Conversation at a Café",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-nebensatz",
    title: "Offizieller Modelltest — Hören Teil 3 (Alltagsgespräch · Nr. 16–22)",
    examPartNumber: 3,
    examPartLabel: "Hören · Teil 3 (Komplett · 7 Aufgaben · R/F)",
    officialFormatBadge: "2 Sprecher · 7 Aufgaben (Richtig/Falsch) · NUR 1× hören!",
    maxPlays: 1,
    recommendedMinutes: 8,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Teil 3): Sie hören ein Gespräch zwischen zwei Freunden (Lara und Jonas) im Café. Achtung: In der echten Prüfung hören Sie das Gespräch NUR EINMAL (1×)! Entscheiden Sie bei den Aufgaben 16 bis 22, ob die Aussagen Richtig oder Falsch sind.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Lara: Hallo Jonas! Schön, dass das heute mit unserem Kaffee geklappt hat. Wie läuft denn dein Umzug? Wohnst du schon in deiner neuen Wohnung? " +
      "Jonas: Hi Lara! Ja, seit letztem Sonntag schlafe ich schon dort, obwohl im Wohnzimmer noch mindestens zehn unausgepackte Kartons stehen. Ich hatte gehofft, am Freitag frei zu bekommen, aber wegen eines dringenden Projekts im Büro musste ich den ganzen Freitag arbeiten. " +
      "Lara: Oh je, das klingt anstrengend. Aber du wolltest doch unbedingt eine Wohnung mit Balkon und einer größeren Küche. Hat sich die Suche gelohnt? " +
      "Jonas: Auf jeden Fall! Die Küche ist superhell, und auf den Balkon scheint den ganzen Nachmittag die Sonne. Nur die Miete ist leider achtzig Euro teurer als in meiner alten Wohnung. Dafür spare ich jetzt die Monatskarte für die U-Bahn, weil ich in zehn Minuten mit dem Fahrrad bei der Arbeit bin. " +
      "Lara: Das gleicht sich dann ja fast wieder aus! Und wie sind deine neuen Nachbarn? In deinem alten Haus gab es doch ständig Ärger wegen lauter Musik. " +
      "Jonas: Hier ist es viel angenehmer. Direkt neben mir wohnt ein älteres Ehepaar, das mir am ersten Abend sogar warme Suppe gebracht hat, weil mein Herd noch nicht angeschlossen war. Der Elektriker kommt leider erst morgen früh. " +
      "Lara: Wie nett von ihnen! Sag mal, machst du denn bald eine kleine Einweihungsparty? " +
      "Jonas: Klar! Dieses Wochenende muss ich noch das Schlafzimmer streichen, aber für nächsten Samstagabend habe ich schon ein paar Freunde eingeladen. Wenn du Lust hast, komm gern ab neunzehn Uhr vorbei! " +
      "Lara: Sehr gern! Soll ich einen Salat oder einen Nachtisch mitbringen? " +
      "Jonas: Salate machen schon mein Bruder und seine Freundin. Aber wenn du dein berühmtes Tiramisu mitbringen könntest, wären alle begeistert!",
    sections: [
      {
        id: "d1",
        label: "Lara",
        speakerRole: "Lara",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Hallo Jonas! Schön, dass das heute mit unserem Kaffee geklappt hat. Wie läuft denn dein Umzug? Wohnst du schon in deiner neuen Wohnung?",
      },
      {
        id: "d2",
        label: "Jonas",
        speakerRole: "Jonas",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Hi Lara! Ja, seit letztem Sonntag schlafe ich schon dort, obwohl im Wohnzimmer noch mindestens zehn unausgepackte Kartons stehen. Ich hatte gehofft, am Freitag frei zu bekommen, aber wegen eines dringenden Projekts im Büro musste ich den ganzen Freitag arbeiten.",
      },
      {
        id: "d3",
        label: "Lara",
        speakerRole: "Lara",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Oh je, das klingt anstrengend. Aber du wolltest doch unbedingt eine Wohnung mit Balkon und einer größeren Küche. Hat sich die Suche gelohnt?",
      },
      {
        id: "d4",
        label: "Jonas",
        speakerRole: "Jonas",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Auf jeden Fall! Die Küche ist superhell, und auf den Balkon scheint den ganzen Nachmittag die Sonne. Nur die Miete ist leider achtzig Euro teurer als in meiner alten Wohnung. Dafür spare ich jetzt die Monatskarte für die U-Bahn, weil ich in zehn Minuten mit dem Fahrrad bei der Arbeit bin.",
      },
      {
        id: "d5",
        label: "Lara",
        speakerRole: "Lara",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Das gleicht sich dann ja fast wieder aus! Und wie sind deine neuen Nachbarn? In deinem alten Haus gab es doch ständig Ärger wegen lauter Musik.",
      },
      {
        id: "d6",
        label: "Jonas",
        speakerRole: "Jonas",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Hier ist es viel angenehmer. Direkt neben mir wohnt ein älteres Ehepaar, das mir am ersten Abend sogar warme Suppe gebracht hat, weil mein Herd noch nicht angeschlossen war. Der Elektriker kommt leider erst morgen früh.",
      },
      {
        id: "d7",
        label: "Lara",
        speakerRole: "Lara",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Wie nett von ihnen! Sag mal, machst du denn bald eine kleine Einweihungsparty?",
      },
      {
        id: "d8",
        label: "Jonas",
        speakerRole: "Jonas",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Klar! Dieses Wochenende muss ich noch das Schlafzimmer streichen, aber für nächsten Samstagabend habe ich schon ein paar Freunde eingeladen. Wenn du Lust hast, komm gern ab neunzehn Uhr vorbei!",
      },
      {
        id: "d9",
        label: "Lara",
        speakerRole: "Lara",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Sehr gern! Soll ich einen Salat oder einen Nachtisch mitbringen?",
      },
      {
        id: "d10",
        label: "Jonas",
        speakerRole: "Jonas",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Salate machen schon mein Bruder und seine Freundin. Aber wenn du dein berühmtes Tiramisu mitbringen könntest, wären alle begeistert!",
      },
    ],
    questions: [
      {
        id: "q16",
        itemNumber: 16,
        questionType: "richtig_falsch",
        questionDe: "Jonas hat bereits alle Umzugskartons in seiner neuen Wohnung ausgepackt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Jonas sagt, dass im Wohnzimmer „noch mindestens zehn unausgepackte Kartons stehen“.",
      },
      {
        id: "q17",
        itemNumber: 17,
        questionType: "richtig_falsch",
        questionDe: "Jonas hatte am letzten Freitag keinen Urlaub, weil er im Büro arbeiten musste.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „aber wegen eines dringenden Projekts im Büro musste ich den ganzen Freitag arbeiten.“",
      },
      {
        id: "q18",
        itemNumber: 18,
        questionType: "richtig_falsch",
        questionDe: "Die neue Wohnung kostet weniger Miete als seine alte Wohnung.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: „Nur die Miete ist leider achtzig Euro teurer als in meiner alten Wohnung.“",
      },
      {
        id: "q19",
        itemNumber: 19,
        questionType: "richtig_falsch",
        questionDe: "Jonas fährt von der neuen Wohnung aus mit dem Fahrrad zur Arbeit.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Er spart die Monatskarte für die U-Bahn, „weil ich in zehn Minuten mit dem Fahrrad bei der Arbeit bin.“",
      },
      {
        id: "q20",
        itemNumber: 20,
        questionType: "richtig_falsch",
        questionDe: "Jonas konnte am ersten Abend selbst kochen, weil sein Herd schon angeschlossen war.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Sein Herd war noch nicht angeschlossen (der Elektriker kommt erst morgen früh); das Nachbar-Ehepaar brachte ihm warme Suppe.",
      },
      {
        id: "q21",
        itemNumber: 21,
        questionType: "richtig_falsch",
        questionDe: "Die Einweihungsparty findet erst am nächsten Samstagabend statt.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Dieses Wochenende streicht er noch das Schlafzimmer; die Feier ist am nächsten Samstagabend ab 19 Uhr.",
      },
      {
        id: "q22",
        itemNumber: 22,
        questionType: "richtig_falsch",
        questionDe: "Jonas bittet Lara, einen Salat für die Party mitzubringen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Salate machen schon sein Bruder und dessen Freundin. Jonas bittet Lara um ihr Tiramisu (einen Nachtisch).",
      },
    ],
    keyVocab: [
      { german: "der Umzugskarton", meaning: "moving box" },
      { german: "sich ausgleichen", meaning: "to balance out / even out" },
      { german: "den Herd anschließen", meaning: "to connect the stove" },
      { german: "die Einweihungsparty", meaning: "housewarming party" },
    ],
  },

  {
    id: "bank-hoeren-b1-official-teil4-01",
    skill: "hoeren",
    level: "B1",
    topicDe: "Arbeit, Beruf & Gesellschaft",
    topicEn: "3-Speaker Radio Debate: The 4-Day Workweek",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-konjunktiv2",
    title: "Offizieller Modelltest — Hören Teil 4 (Radiodiskussion · Nr. 23–30)",
    examPartNumber: 4,
    examPartLabel: "Hören · Teil 4 (Komplett · 8 Aufgaben · Wer sagt was?)",
    officialFormatBadge: "3 Sprecher · 8 Aufgaben (Wer sagt was? a/b/c) · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 12,
    pointsWeight: 27,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Teil 4): Sie hören eine Radiodiskussion. Die Moderatorin Sabine Krug diskutiert mit dem Unternehmensberater Florian Wegner und der Betriebsrätin Claudia Brandt über das Thema „Vier-Tage-Woche“. Sie hören die Diskussion zweimal (2×). Ordnen Sie die Aussagen 23 bis 30 der richtigen Person zu (a, b oder c).",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Moderatorin: Willkommen bei unserem Stadtgespräch am Abend! Immer mehr Beschäftigte wünschen sich eine Vier-Tage-Woche. Laut einer aktuellen Statistik, die unser Radiosender gestern veröffentlicht hat, würden über sechzig Prozent der Befragten lieber vier statt fünf Tage pro Woche arbeiten. Darüber spreche ich heute mit dem Unternehmensberater Florian Wegner und der Betriebsrätin Claudia Brandt. Frau Brandt, warum ist dieses Modell für Sie so wichtig? " +
      "Claudia Brandt: Guten Abend! In unserem Werk haben wir gesehen, dass viele Mitarbeitende durch lange Arbeitswege und familiäre Pflichten dauerhaft erschöpft sind. Wenn man einen festen dritten freien Tag in der Woche hat, sinkt die Zahl der Krankmeldungen spürbar, weil der Körper sich wirklich erholen kann. " +
      "Florian Wegner: Das klingt natürlich attraktiv, Frau Brandt, aber wir müssen realistisch bleiben. Für mittelständische Handwerksbetriebe oder Bäckereien ist eine Vier-Tage-Woche bei vollem Lohn kaum bezahlbar, weil man für den fünften Tag zusätzliche Fachkräfte einstellen müsste, die es auf dem Arbeitsmarkt gar nicht gibt. " +
      "Moderatorin: Ein wichtiger Punkt, Herr Wegner. In unserer Sendung riefen vorhin auch Hörerinnen aus Krankenhäusern an, die fragten, wie Schichtarbeit im Pflegebereich überhaupt an vier Tagen funktionieren soll. " +
      "Claudia Brandt: Gerade in der Pflege verlassen doch viele ihren Beruf, weil die Belastung zu hoch ist! Wenn Kliniken eine Vier-Tage-Woche anbieten, kehren viele Teilzeitkräfte wieder in den Beruf zurück. Außerdem erledigen ausgeruhte Teams ihre Aufgaben oft konzentrierter und machen weniger Fehler. " +
      "Florian Wegner: Ich bin nicht grundsätzlich gegen moderne Arbeitszeiten. Aber statt starrer Gesetze für alle Branchen sollten Firmen lieber flexible Jahresarbeitszeitkonten nutzen: Im Sommer oder vor Weihnachten arbeitet man mehr, und in ruhigen Monaten nimmt man sich dafür längere freie Blöcke. " +
      "Claudia Brandt: Jahreskonten helfen Eltern mit schulpflichtigen Kindern im Alltag leider wenig. Wer jede Woche am Freitag frei hat, kann sich die Kinderbetreuung viel verlässlicher teilen und auch mal ein Ehrenamt im Sportverein übernehmen. " +
      "Moderatorin: Unsere Sendezeit ist fast vorbei. Es zeigt sich, dass es keine einfache Einheitslösung für alle Betriebe gibt. Auf unserer Webseite finden Sie ab sofort alle Studienergebnisse zum Nachlesen.",
    sections: [
      {
        id: "r1",
        label: "a) Moderatorin (Sabine Krug)",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Willkommen bei unserem Stadtgespräch am Abend! Immer mehr Beschäftigte wünschen sich eine Vier-Tage-Woche. Laut einer aktuellen Statistik, die unser Radiosender gestern veröffentlicht hat, würden über sechzig Prozent der Befragten lieber vier statt fünf Tage pro Woche arbeiten. Darüber spreche ich heute mit dem Unternehmensberater Florian Wegner und der Betriebsrätin Claudia Brandt. Frau Brandt, warum ist dieses Modell für Sie so wichtig?",
      },
      {
        id: "r2",
        label: "c) Claudia Brandt (Betriebsrätin)",
        speakerRole: "Claudia Brandt",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Guten Abend! In unserem Werk haben wir gesehen, dass viele Mitarbeitende durch lange Arbeitswege und familiäre Pflichten dauerhaft erschöpft sind. Wenn man einen festen dritten freien Tag in der Woche hat, sinkt die Zahl der Krankmeldungen spürbar, weil der Körper sich wirklich erholen kann.",
      },
      {
        id: "r3",
        label: "b) Florian Wegner (Unternehmensberater)",
        speakerRole: "Florian Wegner",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Das klingt natürlich attraktiv, Frau Brandt, aber wir müssen realistisch bleiben. Für mittelständische Handwerksbetriebe oder Bäckereien ist eine Vier-Tage-Woche bei vollem Lohn kaum bezahlbar, weil man für den fünften Tag zusätzliche Fachkräfte einstellen müsste, die es auf dem Arbeitsmarkt gar nicht gibt.",
      },
      {
        id: "r4",
        label: "a) Moderatorin (Sabine Krug)",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Ein wichtiger Punkt, Herr Wegner. In unserer Sendung riefen vorhin auch Hörerinnen aus Krankenhäusern an, die fragten, wie Schichtarbeit im Pflegebereich überhaupt an vier Tagen funktionieren soll.",
      },
      {
        id: "r5",
        label: "c) Claudia Brandt (Betriebsrätin)",
        speakerRole: "Claudia Brandt",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Gerade in der Pflege verlassen doch viele ihren Beruf, weil die Belastung zu hoch ist! Wenn Kliniken eine Vier-Tage-Woche anbieten, kehren viele Teilzeitkräfte wieder in den Beruf zurück. Außerdem erledigen ausgeruhte Teams ihre Aufgaben oft konzentrierter und machen weniger Fehler.",
      },
      {
        id: "r6",
        label: "b) Florian Wegner (Unternehmensberater)",
        speakerRole: "Florian Wegner",
        edgeVoice: "de-DE-ConradNeural",
        textDe:
          "Ich bin nicht grundsätzlich gegen moderne Arbeitszeiten. Aber statt starrer Gesetze für alle Branchen sollten Firmen lieber flexible Jahresarbeitszeitkonten nutzen: Im Sommer oder vor Weihnachten arbeitet man mehr, und in ruhigen Monaten nimmt man sich dafür längere freie Blöcke.",
      },
      {
        id: "r7",
        label: "c) Claudia Brandt (Betriebsrätin)",
        speakerRole: "Claudia Brandt",
        edgeVoice: "de-DE-KatjaNeural",
        textDe:
          "Jahreskonten helfen Eltern mit schulpflichtigen Kindern im Alltag leider wenig. Wer jede Woche am Freitag frei hat, kann sich die Kinderbetreuung viel verlässlicher teilen und auch mal ein Ehrenamt im Sportverein übernehmen.",
      },
      {
        id: "r8",
        label: "a) Moderatorin (Sabine Krug)",
        speakerRole: "Moderatorin",
        edgeVoice: "de-DE-SeraphinaMultilingualNeural",
        textDe:
          "Unsere Sendezeit ist fast vorbei. Es zeigt sich, dass es keine einfache Einheitslösung für alle Betriebe gibt. Auf unserer Webseite finden Sie ab sofort alle Studienergebnisse zum Nachlesen.",
      },
    ],
    questions: [
      {
        id: "q23",
        itemNumber: 23,
        questionType: "speaker_match",
        questionDe:
          "Über 60 Prozent der Befragten würden laut einer aktuellen Umfrage lieber vier Tage pro Woche arbeiten.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin nennt zu Beginn die Statistik des Radiosenders (über 60 Prozent der Befragten).",
      },
      {
        id: "q24",
        itemNumber: 24,
        questionType: "speaker_match",
        questionDe:
          "Ein dritter freier Tag pro Woche führt dazu, dass Beschäftigte seltener krank werden.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 2,
        explanation:
          "Claudia Brandt sagt: „Wenn man einen festen dritten freien Tag in der Woche hat, sinkt die Zahl der Krankmeldungen spürbar...“",
      },
      {
        id: "q25",
        itemNumber: 25,
        questionType: "speaker_match",
        questionDe:
          "Kleine Handwerksbetriebe finden auf dem Arbeitsmarkt kaum zusätzliches Personal für den fünften Tag.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 1,
        explanation:
          "Florian Wegner erklärt: „weil man für den fünften Tag zusätzliche Fachkräfte einstellen müsste, die es auf dem Arbeitsmarkt gar nicht gibt.“",
      },
      {
        id: "q26",
        itemNumber: 26,
        questionType: "speaker_match",
        questionDe:
          "Hörerinnen aus Krankenhäusern haben gefragt, wie das Modell im Schichtdienst funktionieren soll.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 0,
        explanation:
          "Die Moderatorin berichtet: „In unserer Sendung riefen vorhin auch Hörerinnen aus Krankenhäusern an...“",
      },
      {
        id: "q27",
        itemNumber: 27,
        questionType: "speaker_match",
        questionDe:
          "Ausgeruhte Mitarbeitende arbeiten konzentrierter und machen im Beruf weniger Fehler.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 2,
        explanation:
          "Claudia Brandt betont: „Außerdem erledigen ausgeruhte Teams ihre Aufgaben oft konzentrierter und machen weniger Fehler.“",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "speaker_match",
        questionDe:
          "Unternehmen sollten lieber Jahresarbeitszeitkonten nutzen und die Arbeitszeit je nach Saison verteilen.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 1,
        explanation:
          "Florian Wegner schlägt vor: „statt starrer Gesetze für alle Branchen sollten Firmen lieber flexible Jahresarbeitszeitkonten nutzen...“",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "speaker_match",
        questionDe:
          "Mit einem festen freien Freitag lässt sich die Kinderbetreuung und ein Ehrenamt besser planen.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 2,
        explanation:
          "Claudia Brandt argumentiert: „Wer jede Woche am Freitag frei hat, kann sich die Kinderbetreuung viel verlässlicher teilen und auch mal ein Ehrenamt im Sportverein übernehmen.“",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "speaker_match",
        questionDe:
          "Die Ergebnisse der Studie können im Internet auf der Webseite des Senders nachgelesen werden.",
        options: [
          "a) Die Moderatorin",
          "b) Florian Wegner (Unternehmensberater)",
          "c) Claudia Brandt (Betriebsrätin)",
        ],
        correctIndex: 0,
        explanation:
          "Am Ende sagt die Moderatorin: „Auf unserer Webseite finden Sie ab sofort alle Studienergebnisse zum Nachlesen.“",
      },
    ],
    keyVocab: [
      { german: "die Krankmeldung", meaning: "sick leave notification" },
      { german: "der Fachkräftemangel", meaning: "shortage of skilled workers" },
      { german: "das Jahresarbeitszeitkonto", meaning: "annual working-hours account" },
      { german: "das Ehrenamt übernehmen", meaning: "to take on volunteer work" },
    ],
  },

  // =========================================================================
  // HÖREN · FOCUSED QUICK DRILLS (EXISTING 6 EXERCISES — PRESERVED & TAGGED)
  // =========================================================================
  {
    id: "bank-hoeren-b1-work-01",
    skill: "hoeren",
    level: "B1",
    topicDe: "Arbeit, Beruf & Bewerbung",
    topicEn: "Work, Career & Applications",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-nebensatz",
    title: "Einladung zum Vorstellungsgespräch",
    examPartNumber: 1,
    examPartLabel: "Hören · Teil 1 (Kurztraining)",
    officialFormatBadge: "Kurztext · 3 Aufgaben · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 4,
    instructions:
      "Listen to this voicemail from an HR office (play up to 2 times like Goethe Teil 1), then answer all 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Guten Tag, Frau Weber, hier spricht Lukas Berger aus der Personalabteilung der Firma Nordlicht. Vielen Dank für Ihre Bewerbung als Projektassistentin! Ihr Lebenslauf hat uns sehr gut gefallen, deshalb möchten wir Sie gern zu einem Vorstellungsgespräch einladen. Passt es Ihnen am kommenden Donnerstag um zehn Uhr dreißig in unserem Büro in der Bahnhofstraße zwölf? Da die U-Bahn-Linie vier diese Woche wegen Bauarbeiten nicht fährt, empfehle ich Ihnen, den Bus Nummer achtzehn bis zur Haltestelle Stadtpark zu nehmen. Bitte bringen Sie eine Kopie Ihrer Zeugnisse mit und rufen Sie mich kurz zurück, falls Sie den Termin verschieben müssen.",
    questions: [
      {
        id: "q1",
        questionDe: "Warum ruft Lukas Berger Frau Weber an?",
        options: [
          "Er möchte sie zu einem Vorstellungsgespräch einladen.",
          "Er möchte ihr mitteilen, dass die Stelle schon vergeben ist.",
          "Er bittet sie, ihren Lebenslauf noch einmal per Post zu schicken.",
        ],
        correctIndex: 0,
        explanation:
          "Im Text sagt er ausdrücklich: „deshalb möchten wir Sie gern zu einem Vorstellungsgespräch einladen.“",
      },
      {
        id: "q2",
        questionDe: "Warum soll Frau Weber nicht die U-Bahn-Linie 4 nehmen?",
        options: [
          "Weil die U-Bahn-Station zu weit vom Büro entfernt ist.",
          "Weil die Linie 4 diese Woche wegen Bauarbeiten nicht fährt.",
          "Weil der Bus Nummer 18 schneller und günstiger ist.",
        ],
        correctIndex: 1,
        explanation:
          "Er erklärt: „Da die U-Bahn-Linie vier diese Woche wegen Bauarbeiten nicht fährt, empfehle ich Ihnen, den Bus Nummer achtzehn...“",
      },
      {
        id: "q3",
        questionDe: "Was soll Frau Weber zum Termin mitbringen?",
        options: [
          "Ihren Reisepass.",
          "Eine Kopie ihrer Zeugnisse.",
          "Ein aktuelles Bewerbungsfoto.",
        ],
        correctIndex: 1,
        explanation:
          "Am Ende bittet er sie: „Bitte bringen Sie eine Kopie Ihrer Zeugnisse mit.“",
      },
    ],
    keyVocab: [
      { german: "das Vorstellungsgespräch", meaning: "job interview" },
      { german: "die Personalabteilung", meaning: "HR department" },
      { german: "wegen Bauarbeiten", meaning: "due to construction work" },
      { german: "den Termin verschieben", meaning: "to reschedule the appointment" },
    ],
  },
  {
    id: "bank-hoeren-b1-travel-02",
    skill: "hoeren",
    level: "B1",
    topicDe: "Reisen, Verkehr & Mobilität",
    topicEn: "Travel, Transport & Mobility",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-passiv",
    title: "Durchsage am Hauptbahnhof",
    examPartNumber: 1,
    examPartLabel: "Hören · Teil 1 (Kurztraining)",
    officialFormatBadge: "Durchsage · 3 Aufgaben · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 4,
    instructions:
      "Listen to this German train station announcement carefully and answer all 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Achtung, eine wichtige Durchsage für die Fahrgäste des ICE sechshundertzwanzig nach Hamburg über Hannover. Wegen eines technischen Defekts an der Lokomotive hat dieser Zug heute voraussichtlich fünfundzwanzig Minuten Verspätung. Außerdem ändert sich das Abfahrtsgleis: Der Zug fährt heute nicht von Gleis sieben, sondern von Gleis elf ab. Fahrgäste mit dem Ziel Bremen können alternativ den Regional-Express um vierzehn Uhr zwölf von Gleis drei nehmen. Der Bordbistro-Wagen ist heute leider geschlossen, aber kalte Getränke werden im Wagen vier verkauft. Wir bitten um Ihr Verständnis.",
    questions: [
      {
        id: "q1",
        questionDe: "Warum hat der ICE 620 Verspätung?",
        options: [
          "Wegen schlechten Wetters auf der Strecke.",
          "Wegen eines technischen Defekts an der Lokomotive.",
          "Weil ein anderer Zug das Gleis blockiert.",
        ],
        correctIndex: 1,
        explanation:
          "Die Durchsage nennt den Grund: „Wegen eines technischen Defekts an der Lokomotive...“",
      },
      {
        id: "q2",
        questionDe: "Von welchem Gleis fährt der ICE 620 heute ab?",
        options: ["Von Gleis 3.", "Von Gleis 7.", "Von Gleis 11."],
        correctIndex: 2,
        explanation:
          "„Der Zug fährt heute nicht von Gleis sieben, sondern von Gleis elf ab.“",
      },
      {
        id: "q3",
        questionDe: "Wo bekommen die Fahrgäste heute Getränke im ICE?",
        options: [
          "Im Bordbistro-Wagen.",
          "Im Wagen 4.",
          "Gar nicht, es gibt keine Getränke im Zug.",
        ],
        correctIndex: 1,
        explanation:
          "Das Bordbistro ist geschlossen, „aber kalte Getränke werden im Wagen vier verkauft.“",
      },
    ],
    keyVocab: [
      { german: "die Durchsage", meaning: "announcement" },
      { german: "voraussichtlich", meaning: "expected / presumably" },
      { german: "das Abfahrtsgleis", meaning: "departure platform" },
      { german: "um Verständnis bitten", meaning: "to ask for understanding" },
    ],
  },
  {
    id: "bank-hoeren-b1-health-03",
    skill: "hoeren",
    level: "B1",
    topicDe: "Gesundheit, Ernährung & Sport",
    topicEn: "Health, Nutrition & Fitness",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-infinitiv-zu",
    title: "Radiobeitrag: Bewegung im Arbeitsalltag",
    examPartNumber: 2,
    examPartLabel: "Hören · Teil 2 (Kurztraining)",
    officialFormatBadge: "Radiovortrag · 3 Aufgaben · 1× hören",
    maxPlays: 1,
    recommendedMinutes: 4,
    instructions:
      "Listen to this short German radio segment on health at work (try listening just 1× like Goethe Teil 2!) and answer the 3 comprehension questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Willkommen bei unserem Gesundheitstipp am Morgen! Viele Berufstätige sitzen mehr als acht Stunden am Tag vor dem Bildschirm. Sportmedizinerin Doktor Hannah Klein erklärt, dass man nicht unbedingt jeden Abend ins Fitnessstudio gehen muss, um fit zu bleiben. Viel wichtiger seien kleine Pausen während des Arbeitstages. Sie empfiehlt, jede Stunde kurz aufzustehen, die Schultern zu lockern und nach dem Mittagessen mindestens fünfzehn Minuten an der frischen Luft spazieren zu gehen. Außerdem hilft es, beim Telefonieren durch das Büro zu laufen und die Treppe statt des Aufzugs zu benutzen. Wer diese Gewohnheiten regelmäßig umsetzt, hat laut Studien deutlich seltener Rückenschmerzen.",
    questions: [
      {
        id: "q1",
        questionDe: "Was sagt Doktor Hannah Klein über das Fitnessstudio?",
        options: [
          "Man muss jeden Abend mindestens eine Stunde trainieren.",
          "Man muss nicht unbedingt jeden Abend hingehen, um fit zu bleiben.",
          "Fitnessstudios sind schlecht für Menschen mit Rückenschmerzen.",
        ],
        correctIndex: 1,
        explanation:
          "Sie erklärt, „dass man nicht unbedingt jeden Abend ins Fitnessstudio gehen muss, um fit zu bleiben.“",
      },
      {
        id: "q2",
        questionDe: "Was empfiehlt die Ärztin direkt nach dem Mittagessen?",
        options: [
          "Mindestens 15 Minuten draußen spazieren zu gehen.",
          "Sofort am Schreibtisch weiterzuarbeiten.",
          "Eine kurze Pause im Liegen zu machen.",
        ],
        correctIndex: 0,
        explanation:
          "Sie empfiehlt, „nach dem Mittagessen mindestens fünfzehn Minuten an der frischen Luft spazieren zu gehen.“",
      },
      {
        id: "q3",
        questionDe: "Welchen Effekt haben diese kleinen Gewohnheiten laut Studien?",
        options: [
          "Man schläft zwei Stunden länger.",
          "Man hat deutlich seltener Rückenschmerzen.",
          "Man braucht weniger Urlaubstage.",
        ],
        correctIndex: 1,
        explanation:
          "Im letzten Satz heißt es: „hat laut Studien deutlich seltener Rückenschmerzen.“",
      },
    ],
    keyVocab: [
      { german: "die Berufstätigen", meaning: "working people / professionals" },
      { german: "an der frischen Luft", meaning: "in the fresh air" },
      { german: "die Gewohnheit umsetzen", meaning: "to put a habit into practice" },
      { german: "die Rückenschmerzen", meaning: "back pain" },
    ],
  },
  {
    id: "bank-hoeren-b1-living-04",
    skill: "hoeren",
    level: "B1",
    topicDe: "Wohnen, Alltag & Nachbarschaft",
    topicEn: "Housing, Daily Life & Neighbors",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-prepositions",
    title: "Nachricht von der Hausverwaltung",
    examPartNumber: 1,
    examPartLabel: "Hören · Teil 1 (Kurztraining)",
    officialFormatBadge: "Telefonnachricht · 3 Aufgaben · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 4,
    instructions:
      "Listen to this message from a German property manager about apartment maintenance.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Hallo liebe Mieterinnen und Mieter der Gartenstraße achtundzwanzig. Hier ist Herr Hoffmann von der Hausverwaltung. Am kommenden Montag zwischen acht und zwölf Uhr werden in allen Wohnungen die Heizungszähler abgelesen. Es ist sehr wichtig, dass die Handwerker Zugang zu allen Heizkörpern haben. Bitte räumen Sie Möbel oder Kartons, die direkt vor der Heizung stehen, vorher zur Seite. Falls Sie am Montagvormittag arbeiten müssen, können Sie Ihren Schlüssel gern bei einem Nachbarn hinterlegen und uns per E-Mail informieren. Bei Fragen erreichen Sie unser Büro dienstags und donnerstags telefonisch.",
    questions: [
      {
        id: "q1",
        questionDe: "Was passiert am kommenden Montag zwischen 8 und 12 Uhr?",
        options: [
          "Die Heizungen werden komplett neu eingebaut.",
          "Die Heizungszähler werden in allen Wohnungen abgelesen.",
          "Das Treppenhaus wird frisch gestrichen.",
        ],
        correctIndex: 1,
        explanation:
          "Herr Hoffmann sagt: „Am kommenden Montag zwischen acht und zwölf Uhr werden in allen Wohnungen die Heizungszähler abgelesen.“",
      },
      {
        id: "q2",
        questionDe: "Wie sollen die Mieter ihre Wohnung vorbereiten?",
        options: [
          "Die Fenster weit öffnen.",
          "Die Heizung komplett ausschalten.",
          "Möbel oder Kartons vor den Heizkörpern wegräumen.",
        ],
        correctIndex: 2,
        explanation:
          "„Bitte räumen Sie Möbel oder Kartons, die direkt vor der Heizung stehen, vorher zur Seite.“",
      },
      {
        id: "q3",
        questionDe: "Was können Mieter tun, die am Montagvormittag arbeiten?",
        options: [
          "Den Schlüssel bei einem Nachbarn abgeben und eine E-Mail schicken.",
          "Den Termin einfach auf Dienstag verschieben.",
          "Den Schlüssel in den Briefkasten der Hausverwaltung werfen.",
        ],
        correctIndex: 0,
        explanation:
          "„können Sie Ihren Schlüssel gern bei einem Nachbarn hinterlegen und uns per E-Mail informieren.“",
      },
    ],
    keyVocab: [
      { german: "die Hausverwaltung", meaning: "property management" },
      { german: "der Heizungszähler", meaning: "heating meter" },
      { german: "Zugang haben zu", meaning: "to have access to" },
      { german: "den Schlüssel hinterlegen", meaning: "to leave the key with someone" },
    ],
  },
  {
    id: "bank-hoeren-a2-leisure-05",
    skill: "hoeren",
    level: "A2",
    topicDe: "Freizeit, Kultur & Feste",
    topicEn: "Free Time, Culture & Celebrations",
    vocabCategoryId: "voc-leisure",
    grammarStandardId: "gram-past",
    title: "Einladung zum Sommerfest im Park",
    examPartNumber: 1,
    examPartLabel: "Hören · Teil 1 (A2)",
    officialFormatBadge: "Sprachnachricht · 3 Aufgaben · 2× hören",
    maxPlays: 2,
    recommendedMinutes: 4,
    instructions:
      "Listen to Mia's voice message about a Saturday summer gathering and answer all 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified A2 Bank",
    passageDe:
      "Hi! Hier ist Mia. Ich wollte dich nur kurz an unser kleines Sommerfest am Samstag erinnern. Wir treffen uns um sechzehn Uhr am großen Eingang vom Westpark, direkt neben dem Eis-Café. Ich bringe schon einen Kartoffelsalat und Teller mit. Kannst du vielleicht zwei Flaschen Apfelsaft oder Wasser mitbringen? Wenn es am Samstag regnet, gehen wir stattdessen einfach zu mir nach Hause in die Schillerstraße. Schreib mir bitte bis Freitagabend, ob du kommst!",
    questions: [
      {
        id: "q1",
        questionDe: "Wo treffen sich die Freunde bei gutem Wetter?",
        options: [
          "In der Schillerstraße bei Mia.",
          "Am großen Eingang vom Westpark neben dem Eis-Café.",
          "Im Restaurant im Zentrum.",
        ],
        correctIndex: 1,
        explanation:
          "Mia sagt: „Wir treffen uns um sechzehn Uhr am großen Eingang vom Westpark, direkt neben dem Eis-Café.“",
      },
      {
        id: "q2",
        questionDe: "Was soll der Zuhörer mitbringen?",
        options: [
          "Kartoffelsalat und Teller.",
          "Einen Kuchen.",
          "Apfelsaft oder Wasser.",
        ],
        correctIndex: 2,
        explanation:
          "Mia fragt: „Kannst du vielleicht zwei Flaschen Apfelsaft oder Wasser mitbringen?“",
      },
      {
        id: "q3",
        questionDe: "Was machen sie, wenn es am Samstag regnet?",
        options: [
          "Sie sagen das Fest ab.",
          "Sie gehen zu Mia nach Hause.",
          "Sie treffen sich am Sonntag.",
        ],
        correctIndex: 1,
        explanation:
          "„Wenn es am Samstag regnet, gehen wir stattdessen einfach zu mir nach Hause.“",
      },
    ],
    keyVocab: [
      { german: "erinnern an", meaning: "to remind of" },
      { german: "stattdessen", meaning: "instead" },
      { german: "mitbringen", meaning: "to bring along" },
    ],
  },
  {
    id: "bank-hoeren-b2-media-06",
    skill: "hoeren",
    level: "B2",
    topicDe: "Medien, Digitales & Kommunikation",
    topicEn: "Media, Internet & Communication",
    vocabCategoryId: "voc-media",
    grammarStandardId: "gram-b2-connectors",
    title: "Podcast-Ausschnitt: Digital Detox im Urlaub",
    examPartNumber: 2,
    examPartLabel: "Hören · Teil 2 (B2)",
    officialFormatBadge: "Radiokommentar · 3 Aufgaben · 1× hören",
    maxPlays: 1,
    recommendedMinutes: 5,
    instructions:
      "Listen to this B2 podcast commentary on taking a digital break during vacation.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B2 Bank",
    passageDe:
      "Immer mehr Hotels im Alpenraum werben inzwischen mit sogenannten Digital-Detox-Angeboten, bei denen Gäste beim Einchecken freiwillig ihr Smartphone abgeben. Einerseits berichten viele Urlauber, dass sie ohne ständige Benachrichtigungen deutlich tiefer schlafen und Gespräche wieder bewusster führen. Andererseits zeigen Befragungen, dass gerade Selbstständige die ersten zwei Tage als unangenehm empfinden, weil sie befürchten, wichtige Kundenanfragen zu verpassen. Medienpsychologen raten daher zu einem pragmatischen Mittelweg: Statt das Gerät komplett wegzusperren, sollte man feste Zeitfenster von dreißig Minuten am Tag festlegen, in denen E-Mails geprüft werden.",
    questions: [
      {
        id: "q1",
        questionDe: "Was berichten viele Gäste über das Digital-Detox-Angebot?",
        options: [
          "Dass sie schlechter schlafen, weil sie unruhig sind.",
          "Dass sie tiefer schlafen und Gespräche bewusster führen.",
          "Dass die Hotels ohne WLAN deutlich günstiger sind.",
        ],
        correctIndex: 1,
        explanation:
          "Im Text heißt es: „dass sie ohne ständige Benachrichtigungen deutlich tiefer schlafen und Gespräche wieder bewusster führen.“",
      },
      {
        id: "q2",
        questionDe: "Warum finden manche Selbstständige die ersten zwei Tage schwierig?",
        options: [
          "Weil sie keine Fotos von den Bergen machen können.",
          "Weil sie Angst haben, wichtige Kundenanfragen zu verpassen.",
          "Weil das Hotelpersonal unfreundlich ist.",
        ],
        correctIndex: 1,
        explanation:
          "„weil sie befürchten, wichtige Kundenanfragen zu verpassen.“",
      },
      {
        id: "q3",
        questionDe: "Was empfehlen Medienpsychologen als Mittelweg?",
        options: [
          "Das Smartphone im Urlaub vollständig auszuschalten.",
          "Nur abends nach Mitternacht E-Mails zu lesen.",
          "Feste tägliche Zeitfenster von 30 Minuten für E-Mails festzulegen.",
        ],
        correctIndex: 2,
        explanation:
          "Sie raten, „feste Zeitfenster von dreißig Minuten am Tag festzulegen, in denen E-Mails geprüft werden.“",
      },
    ],
    keyVocab: [
      { german: "die Benachrichtigung", meaning: "notification" },
      { german: "befürchten", meaning: "to fear / worry that" },
      { german: "der pragmatische Mittelweg", meaning: "pragmatic middle ground" },
      { german: "das Zeitfenster festlegen", meaning: "to set a time window" },
    ],
  },

  // =========================================================================
  // LESEN · OFFICIAL GOETHE B1 FULL PART SETS (TEIL 1, 2, 3, 4, 5)
  // =========================================================================
  {
    id: "bank-lesen-b1-official-teil1-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Reisen, Verkehr & Alltag",
    topicEn: "Personal Blog Post: One Month Without a Car",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-nebensatz",
    title: "Offizieller Modelltest — Lesen Teil 1 (Blogeintrag · Nr. 1–6)",
    examPartNumber: 1,
    examPartLabel: "Lesen · Teil 1 (Komplett · 6 Aufgaben · R/F)",
    officialFormatBadge: "Blogeintrag · 6 Aufgaben (Richtig / Falsch) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Lesen Teil 1): Lesen Sie den Blogeintrag von Mara und die Aufgaben 1 bis 6 dazu. Wählen Sie: Sind die Aussagen Richtig oder Falsch? (Arbeitszeit: ca. 10 Minuten)",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Maras Alltagsblog · Sonntag, 14. Oktober\n\n" +
      "Vor vier Wochen ist mein altes Auto mitten auf dem Weg zur Arbeit stehen geblieben. In der Werkstatt sagte mir der Mechaniker, dass die Reparatur fast zweitausend Euro kosten würde. Da ich ohnehin schon länger überlegt hatte, mein Auto zu verkaufen, habe ich mich für ein Experiment entschieden: einen ganzen Monat lang in Freiburg komplett ohne eigenes Auto auszukommen.\n\n" +
      "In der ersten Woche war die Umstellung gar nicht so leicht. Weil es morgens oft stark geregnet hat, bin ich nicht mit dem Fahrrad gefahren, sondern habe die Straßenbahn genommen. Dabei habe ich gemerkt, dass ich zwar zehn Minuten früher aus dem Haus gehen muss, die Fahrtzeit aber wunderbar nutzen kann, um in Ruhe ein Buch zu lesen – etwas, wofür ich früher im Berufsverkehr nie Zeit hatte.\n\n" +
      "Am zweiten Wochenende stand ein großer Einkauf für das Geburtstagsfest meiner Mutter an. Früher hätte ich dafür selbstverständlich den Kofferraum vollgepackt. Diesmal habe ich mir über eine Nachbarschafts-App kostenlos ein elektrisches Lastenrad ausgeliehen. Anfangs war das Steuern in den Kurven etwas ungewohnt, doch nach ein paar Straßen machte es richtig Spaß, und alle Getränkekisten passten problemlos hinein.\n\n" +
      "Nur als wir letzten Sonntag unsere Freunde in einem kleinen Dorf im Schwarzwald besuchen wollten, war es mit dem Bus kompliziert, weil am Sonntag nur alle zwei Stunden eine Verbindung fährt. Dafür haben mein Freund und ich uns einfach für vier Stunden ein Carsharing-Auto direkt an unserer Straßenecke gebucht.\n\n" +
      "Mein Fazit nach dreißig Tagen: Ich habe fast zweihundert Euro für Benzin und Versicherung gespart und fühle mich viel fitter. Mein altes Auto habe ich gestern endgültig verkauft!",
    questions: [
      {
        id: "q1",
        itemNumber: 1,
        questionType: "richtig_falsch",
        questionDe: "Mara hat ihr altes Auto für 2.000 Euro in der Werkstatt reparieren lassen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Die Reparatur hätte fast 2.000 Euro gekostet; stattdessen hat sie das Experiment ohne eigenes Auto gestartet und das Auto am Ende verkauft.",
      },
      {
        id: "q2",
        itemNumber: 2,
        questionType: "richtig_falsch",
        questionDe: "In der ersten Woche ist Mara wegen des Regens morgens mit der Straßenbahn gefahren.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Weil es morgens oft stark geregnet hat, bin ich nicht mit dem Fahrrad gefahren, sondern habe die Straßenbahn genommen.“",
      },
      {
        id: "q3",
        itemNumber: 3,
        questionType: "richtig_falsch",
        questionDe: "Mit der Straßenbahn kann Mara morgens zehn Minuten länger schlafen als früher.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Sie muss „zehn Minuten früher aus dem Haus gehen“ als vorher.",
      },
      {
        id: "q4",
        itemNumber: 4,
        questionType: "richtig_falsch",
        questionDe: "Für den Einkauf zum Geburtstag ihrer Mutter musste Mara für das Lastenrad nichts bezahlen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: „Diesmal habe ich mir über eine Nachbarschafts-App kostenlos ein elektrisches Lastenrad ausgeliehen.“",
      },
      {
        id: "q5",
        itemNumber: 5,
        questionType: "richtig_falsch",
        questionDe: "Mara und ihr Freund sind am Sonntag mit dem Bus zu ihren Freunden in den Schwarzwald gefahren.",
        options: ["Richtig", "Falsch"],
        correctIndex: 1,
        explanation:
          "Falsch: Mit dem Bus war es am Sonntag kompliziert, deshalb haben sie „sich einfach für vier Stunden ein Carsharing-Auto direkt an unserer Straßenecke gebucht.“",
      },
      {
        id: "q6",
        itemNumber: 6,
        questionType: "richtig_falsch",
        questionDe: "Nach dem Monat hat Mara beschlossen, auch in Zukunft kein eigenes Auto mehr zu besitzen.",
        options: ["Richtig", "Falsch"],
        correctIndex: 0,
        explanation:
          "Richtig: Sie hat fast 200 Euro gespart, fühlt sich fitter und schreibt: „Mein altes Auto habe ich gestern endgültig verkauft!“",
      },
    ],
    keyVocab: [
      { german: "stehen bleiben (Auto)", meaning: "to break down / stall" },
      { german: "die Umstellung", meaning: "adjustment / transition" },
      { german: "das Lastenrad", meaning: "cargo bike" },
      { german: "endgültig", meaning: "once and for all / permanently" },
    ],
  },

  {
    id: "bank-lesen-b1-official-teil2-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Umwelt, Freizeit & Gesellschaft",
    topicEn: "2 Press Articles: Urban Gardens & Senior E-Bike Courses",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-relativsatz",
    title: "Offizieller Modelltest — Lesen Teil 2 (2 Zeitungsartikel · Nr. 7–12)",
    examPartNumber: 2,
    examPartLabel: "Lesen · Teil 2 (Komplett · 6 Aufgaben · a/b/c)",
    officialFormatBadge: "2 Presseartikel · 6 Aufgaben (a/b/c) · ~20 Min.",
    recommendedMinutes: 20,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Lesen Teil 2): Lesen Sie die beiden Zeitungsartikel A und B und die Aufgaben 7 bis 12. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c. (Arbeitszeit: ca. 20 Minuten)",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "ARTIKEL A (Zu Aufgaben 7–9): Grüne Oasen zwischen Hochhäusern — Gemeinschaftsgärten boomen\n" +
      "Auf einem ehemaligen Parkplatz im Leipziger Süden wachsen heute Tomaten, Kräuter und Sonnenblumen in über sechzig Holzkisten. Vor drei Jahren gründeten Anwohner hier den Verein „Stadtgrün“, um brachliegende Flächen gemeinsam zu bepflanzen. Inzwischen gibt es in deutschen Städten mehr als achthundert solcher Gemeinschaftsgärten. Wer mitmachen möchte, braucht keinen eigenen Gartenbesitz: Für einen Jahresbeitrag von zwanzig Euro für Wasser und Erde kann jede Familie ein Hochbeet pflegen. Ein Teil der Ernte wird jeden Samstag an eine lokale Suppenküche gespendet. Laut Stadtplanern kühlen die grünen Flächen im Sommer zudem das Viertel ab und bringen Menschen unterschiedlicher Generationen ins Gespräch.\n\n" +
      "ARTIKEL B (Zu Aufgaben 10–12): Sicher auf zwei Rädern — Fahrsicherheitstraining für E-Bikes\n" +
      "Elektrofahrräder, sogenannte Pedelecs, verkaufen sich in Deutschland so gut wie nie zuvor. Besonders Menschen über sechzig Jahre schätzen den elektrischen Rückenwind bei Gegenwind oder steilen Hügeln. Doch die Verkehrsunfallstatistik zeigt auch eine Schattenseite: Da E-Bikes deutlich schwerer sind als herkömmliche Fahrräder und schneller beschleunigen, unterschätzen viele Einsteiger den längeren Bremsweg. Der Allgemeine Deutsche Fahrrad-Club (ADFC) bietet deshalb ab April in dreißig Städten spezielle Übungskurse auf autofreien Übungsplätzen an. In drei Stunden trainieren die Teilnehmenden das sichere Anfahren am Berg, enge Kurven und Notbremsungen. Viele Krankenkassen und Kommunen übernehmen bereits die Hälfte der Kursgebühr.",
    sections: [
      {
        id: "art-a",
        label: "Artikel A (Zu Aufgaben 7–9)",
        title: "Grüne Oasen zwischen Hochhäusern — Gemeinschaftsgärten boomen",
        textDe:
          "Auf einem ehemaligen Parkplatz im Leipziger Süden wachsen heute Tomaten, Kräuter und Sonnenblumen in über sechzig Holzkisten. Vor drei Jahren gründeten Anwohner hier den Verein „Stadtgrün“, um brachliegende Flächen gemeinsam zu bepflanzen. Inzwischen gibt es in deutschen Städten mehr als achthundert solcher Gemeinschaftsgärten. Wer mitmachen möchte, braucht keinen eigenen Gartenbesitz: Für einen Jahresbeitrag von zwanzig Euro für Wasser und Erde kann jede Familie ein Hochbeet pflegen. Ein Teil der Ernte wird jeden Samstag an eine lokale Suppenküche gespendet. Laut Stadtplanern kühlen die grünen Flächen im Sommer zudem das Viertel ab und bringen Menschen unterschiedlicher Generationen ins Gespräch.",
      },
      {
        id: "art-b",
        label: "Artikel B (Zu Aufgaben 10–12)",
        title: "Sicher auf zwei Rädern — Fahrsicherheitstraining für E-Bikes",
        textDe:
          "Elektrofahrräder, sogenannte Pedelecs, verkaufen sich in Deutschland so gut wie nie zuvor. Besonders Menschen über sechzig Jahre schätzen den elektrischen Rückenwind bei Gegenwind oder steilen Hügeln. Doch die Verkehrsunfallstatistik zeigt auch eine Schattenseite: Da E-Bikes deutlich schwerer sind als herkömmliche Fahrräder und schneller beschleunigen, unterschätzen viele Einsteiger den längeren Bremsweg. Der Allgemeine Deutsche Fahrrad-Club (ADFC) bietet deshalb ab April in dreißig Städten spezielle Übungskurse auf autofreien Übungsplätzen an. In drei Stunden trainieren die Teilnehmenden das sichere Anfahren am Berg, enge Kurven und Notbremsungen. Viele Krankenkassen und Kommunen übernehmen bereits die Hälfte der Kursgebühr.",
      },
    ],
    questions: [
      {
        id: "q7",
        itemNumber: 7,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "In diesem Text geht es darum, dass ...",
        options: [
          "immer mehr Stadtbewohner gemeinsam auf öffentlichen Flächen Obst und Gemüse anbauen.",
          "die Stadt Leipzig neue Parkplätze für Anwohner im Süden baut.",
          "Supermärkte in deutschen Städten nur noch regionales Gemüse verkaufen dürfen.",
        ],
        correctIndex: 0,
        explanation:
          "Der Artikel beschreibt den Boom von über 800 Gemeinschaftsgärten wie dem Verein „Stadtgrün“ auf einem ehemaligen Parkplatz in Leipzig.",
      },
      {
        id: "q8",
        itemNumber: 8,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Wie können Familien beim Verein „Stadtgrün“ ein Hochbeet bekommen?",
        options: [
          "Sie müssen ein eigenes Grundstück in der Stadt kaufen.",
          "Sie zahlen zwanzig Euro im Jahr für Wasser und Erde.",
          "Sie müssen jeden Samstag in einer Suppenküche kochen.",
        ],
        correctIndex: 1,
        explanation:
          "„Für einen Jahresbeitrag von zwanzig Euro für Wasser und Erde kann jede Familie ein Hochbeet pflegen.“",
      },
      {
        id: "q9",
        itemNumber: 9,
        sectionLabel: "Artikel A",
        questionType: "mcq",
        questionDe: "Welchen positiven Effekt nennen Stadtplaner neben der Ernte?",
        options: [
          "Die Wohnungen rund um den Garten werden günstiger.",
          "Die Gärten sorgen im Sommer für Kühlung und fördern den Kontakt zwischen Generationen.",
          "In der Straße gibt es keinen Autoverkehr mehr.",
        ],
        correctIndex: 1,
        explanation:
          "„Laut Stadtplanern kühlen die grünen Flächen im Sommer zudem das Viertel ab und bringen Menschen unterschiedlicher Generationen ins Gespräch.“",
      },
      {
        id: "q10",
        itemNumber: 10,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Warum passieren mit E-Bikes laut Statistik häufiger Unfälle?",
        options: [
          "Weil die Batterien während der Fahrt plötzlich ausgehen.",
          "Weil viele Einsteiger das höhere Gewicht, die Beschleunigung und den längeren Bremsweg unterschätzen.",
          "Weil E-Bikes auf normalen Radwegen verboten sind.",
        ],
        correctIndex: 1,
        explanation:
          "„Da E-Bikes deutlich schwerer sind als herkömmliche Fahrräder und schneller beschleunigen, unterschätzen viele Einsteiger den längeren Bremsweg.“",
      },
      {
        id: "q11",
        itemNumber: 11,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Was lernen die Teilnehmer in den dreistündigen Kursen des ADFC?",
        options: [
          "Wie man den Elektromotor zu Hause selbst repariert.",
          "Die Verkehrsregeln für den Autoführerschein.",
          "Sicheres Anfahren am Berg, enge Kurven und Notbremsungen auf einem autofreien Platz.",
        ],
        correctIndex: 2,
        explanation:
          "„In drei Stunden trainieren die Teilnehmenden das sichere Anfahren am Berg, enge Kurven und Notbremsungen.“",
      },
      {
        id: "q12",
        itemNumber: 12,
        sectionLabel: "Artikel B",
        questionType: "mcq",
        questionDe: "Wie werden die Kurse finanziell unterstützt?",
        options: [
          "Viele Krankenkassen und Städte bezahlen die Hälfte der Kursgebühr.",
          "Fahrradgeschäfte schenken jedem Teilnehmer einen neuen Helm.",
          "Für Personen unter 60 Jahren ist der Kurs komplett kostenlos.",
        ],
        correctIndex: 0,
        explanation:
          "„Viele Krankenkassen und Kommunen übernehmen bereits die Hälfte der Kursgebühr.“",
      },
    ],
    keyVocab: [
      { german: "brachliegende Flächen", meaning: "unused / fallow land" },
      { german: "das Hochbeet", meaning: "raised garden bed" },
      { german: "den Bremsweg unterschätzen", meaning: "to underestimate braking distance" },
      { german: "die Gebühr übernehmen", meaning: "to cover the fee" },
    ],
  },

  {
    id: "bank-lesen-b1-official-teil3-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Alltag, Kurse, Arbeit & Dienstleistungen",
    topicEn: "Match 7 Everyday Situations to Classified Ads A–H (or 0)",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-prepositions",
    title: "Offizieller Modelltest — Lesen Teil 3 (Anzeigen zuordnen · Nr. 13–19)",
    examPartNumber: 3,
    examPartLabel: "Lesen · Teil 3 (Komplett · 7 Aufgaben · Anzeigen A–H / 0)",
    officialFormatBadge: "8 Anzeigen (A–H) · 7 Situationen zuordnen · ~15 Min.",
    recommendedMinutes: 15,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Lesen Teil 3): Lesen Sie die Situationen 13 bis 19 und die Anzeigen A bis H aus verschiedenen deutschen Medien. Wählen Sie für jede Situation die passende Anzeige. Für eine Situation gibt es keine passende Anzeige (wählen Sie dann „0 — Keine passende Anzeige“).",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "ANZEIGE A — Fahrradwerkstatt „Rückenwind“: Schnelle Reparatur von Stadträdern und E-Bikes innerhalb von 24 Stunden! Verkauf von geprüften Gebrauchträdern mit 1 Jahr Garantie. Mo–Sa 9–18 Uhr.\n\n" +
      "ANZEIGE B — Volkshochschule Zentrum (Abendkurs): „Rhetorik & souverän präsentieren im Beruf“. Für alle, die bei Meetings und Vorträgen sicherer sprechen möchten. Dienstags 19:00–21:00 Uhr, 6 Termine.\n\n" +
      "ANZEIGE C — Musikschule Klangwelt: Klavier-, Gitarren- und Geigenunterricht für Kinder ab 6 Jahren und Jugendliche. Kostenlose Schnupperstunde jeden Mittwochnachmittag!\n\n" +
      "ANZEIGE D — Umzugsservice „Fix & Sicher“: Wir übernehmen Ihren kompletten Wohnungsumzug inkl. Möbelmontage. Auf Wunsch vermieten wir auch günstige Transporter für Selbstfahrer am Wochenende.\n\n" +
      "ANZEIGE E — Café & Co-Working „Werkbank“: Ruhige Schreibtische mit schnellem Glasfaser-WLAN, Steckdosen an jedem Platz und separater Telefonkabine. Tagespass inkl. Kaffee-Flatrate nur 14 €.\n\n" +
      "ANZEIGE F — Hundeschule & Tagesbetreuung Pfötchen: Liebevolle Ganztagsbetreuung für Ihren Hund auf großem eingezäuntem Wiesengelände, während Sie im Büro sind. Bringzeit ab 7:30 Uhr.\n\n" +
      "ANZEIGE G — Sprachcafé International im Bürgerhaus: Jeden Donnerstag ab 18 Uhr Deutsch sprechen in lockerer Runde bei Tee und Gebäck. Offen für alle Niveaus ab A2, Eintritt frei, keine Anmeldung nötig!\n\n" +
      "ANZEIGE H — Nähstudio & Änderungsschneiderei Yilmaz: Wir kürzen Hosen, Kleider und Vorhänge, tauschen defekte Reißverschlüsse an Winterjacken aus und nähen Tischdecken nach Maß.",
    sections: [
      {
        id: "ad-a",
        label: "Anzeige A",
        title: "Fahrradwerkstatt „Rückenwind“",
        textDe:
          "Schnelle Reparatur von Stadträdern und E-Bikes innerhalb von 24 Stunden! Verkauf von geprüften Gebrauchträdern mit 1 Jahr Garantie. Mo–Sa 9–18 Uhr.",
      },
      {
        id: "ad-b",
        label: "Anzeige B",
        title: "Volkshochschule Zentrum (Abendkurs)",
        textDe:
          "„Rhetorik & souverän präsentieren im Beruf“. Für alle, die bei Meetings und Vorträgen sicherer sprechen möchten. Dienstags 19:00–21:00 Uhr, 6 Termine.",
      },
      {
        id: "ad-c",
        label: "Anzeige C",
        title: "Musikschule Klangwelt",
        textDe:
          "Klavier-, Gitarren- und Geigenunterricht für Kinder ab 6 Jahren und Jugendliche. Kostenlose Schnupperstunde jeden Mittwochnachmittag!",
      },
      {
        id: "ad-d",
        label: "Anzeige D",
        title: "Umzugsservice „Fix & Sicher“",
        textDe:
          "Wir übernehmen Ihren kompletten Wohnungsumzug inkl. Möbelmontage. Auf Wunsch vermieten wir auch günstige Transporter für Selbstfahrer am Wochenende.",
      },
      {
        id: "ad-e",
        label: "Anzeige E",
        title: "Café & Co-Working „Werkbank“",
        textDe:
          "Ruhige Schreibtische mit schnellem Glasfaser-WLAN, Steckdosen an jedem Platz und separater Telefonkabine. Tagespass inkl. Kaffee-Flatrate nur 14 €.",
      },
      {
        id: "ad-f",
        label: "Anzeige F",
        title: "Hundeschule & Tagesbetreuung Pfötchen",
        textDe:
          "Liebevolle Ganztagsbetreuung für Ihren Hund auf großem eingezäuntem Wiesengelände, während Sie im Büro sind. Bringzeit ab 7:30 Uhr.",
      },
      {
        id: "ad-g",
        label: "Anzeige G",
        title: "Sprachcafé International im Bürgerhaus",
        textDe:
          "Jeden Donnerstag ab 18 Uhr Deutsch sprechen in lockerer Runde bei Tee und Gebäck. Offen für alle Niveaus ab A2, Eintritt frei, keine Anmeldung nötig!",
      },
      {
        id: "ad-h",
        label: "Anzeige H",
        title: "Nähstudio & Änderungsschneiderei Yilmaz",
        textDe:
          "Wir kürzen Hosen, Kleider und Vorhänge, tauschen defekte Reißverschlüsse an Winterjacken aus und nähen Tischdecken nach Maß.",
      },
    ],
    questions: [
      {
        id: "q13",
        itemNumber: 13,
        sectionLabel: "Situation 13",
        questionType: "ad_match",
        questionDe:
          "Bei Herrn Krögers Wohnung wird morgen gebohrt. Er sucht für einen Tag einen ruhigen Arbeitsplatz mit schnellem Internet, an dem er ungestört telefonieren kann.",
        options: [
          "Anzeige A (Fahrradwerkstatt)",
          "Anzeige B (VHS Rhetorik)",
          "Anzeige D (Umzugsservice)",
          "Anzeige E (Café & Co-Working „Werkbank“)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 3,
        explanation:
          "Anzeige E bietet ruhige Schreibtische mit Glasfaser-WLAN, separater Telefonkabine und Tagespass.",
      },
      {
        id: "q14",
        itemNumber: 14,
        sectionLabel: "Situation 14",
        questionType: "ad_match",
        questionDe:
          "Frau Santos ist neu in der Stadt und möchte donnerstags nach der Arbeit kostenlos und ohne feste Kursanmeldung ihr gesprochenes Deutsch üben.",
        options: [
          "Anzeige B (VHS Rhetorik)",
          "Anzeige C (Musikschule)",
          "Anzeige G (Sprachcafé International)",
          "Anzeige H (Änderungsschneiderei)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 2,
        explanation:
          "Anzeige G: Jeden Donnerstag ab 18 Uhr Deutsch sprechen, Eintritt frei, keine Anmeldung nötig.",
      },
      {
        id: "q15",
        itemNumber: 15,
        sectionLabel: "Situation 15",
        questionType: "ad_match",
        questionDe:
          "An der warmen Winterjacke von Lukas ist der Reißverschluss kaputtgegangen. Er möchte ihn reparieren lassen, statt eine neue Jacke zu kaufen.",
        options: [
          "Anzeige A (Fahrradwerkstatt)",
          "Anzeige D (Umzugsservice)",
          "Anzeige F (Hundetagesbetreuung)",
          "Anzeige H (Nähstudio & Änderungsschneiderei Yilmaz)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 3,
        explanation:
          "Anzeige H: „tauschen defekte Reißverschlüsse an Winterjacken aus“.",
      },
      {
        id: "q16",
        itemNumber: 16,
        sectionLabel: "Situation 16",
        questionType: "ad_match",
        questionDe:
          "Sarah wurde zur Teamleiterin befördert, ist aber bei Vorträgen vor Kunden noch nervös und möchte an einem Abend pro Woche das sichere Auftreten trainieren.",
        options: [
          "Anzeige B (VHS Abendkurs: Rhetorik & souverän präsentieren)",
          "Anzeige E (Co-Working)",
          "Anzeige G (Sprachcafé)",
          "Anzeige C (Musikschule)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 0,
        explanation:
          "Anzeige B: „Rhetorik & souverän präsentieren im Beruf ... Dienstags 19:00–21:00 Uhr“.",
      },
      {
        id: "q17",
        itemNumber: 17,
        sectionLabel: "Situation 17",
        questionType: "ad_match",
        questionDe:
          "Familie Becker fährt im August für zwei Wochen nach Spanien und sucht jemanden, der in dieser Zeit zweimal täglich in ihre Wohnung kommt, um ihre zwei Katzen zu füttern.",
        options: [
          "Anzeige D (Umzugsservice)",
          "Anzeige F (Hundeschule & Tagesbetreuung)",
          "Anzeige G (Sprachcafé)",
          "Anzeige H (Nähstudio)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 4,
        explanation:
          "0 — Keine passende Anzeige: Anzeige F betreut nur Hunde tagsüber auf dem Wiesengelände (keine Katzenbetreuung in der Wohnung während des Urlaubs).",
      },
      {
        id: "q18",
        itemNumber: 18,
        sectionLabel: "Situation 18",
        questionType: "ad_match",
        questionDe:
          "Tom zieht am Samstag in eine andere Straße um. Seine Freunde helfen ihm beim Tragen, deshalb möchte er für das Wochenende nur einen großen Lieferwagen mieten und selbst fahren.",
        options: [
          "Anzeige A (Fahrradwerkstatt)",
          "Anzeige D (Umzugsservice „Fix & Sicher“)",
          "Anzeige E (Co-Working)",
          "Anzeige F (Hundeschule)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 1,
        explanation:
          "Anzeige D: „Auf Wunsch vermieten wir auch günstige Transporter für Selbstfahrer am Wochenende.“",
      },
      {
        id: "q19",
        itemNumber: 19,
        sectionLabel: "Situation 19",
        questionType: "ad_match",
        questionDe:
          "Marias Fahrrad wurde gestohlen. Sie sucht ein gebrauchtes Rad, möchte aber sicher sein, dass es technisch geprüft wurde und Garantie hat.",
        options: [
          "Anzeige A (Fahrradwerkstatt „Rückenwind“)",
          "Anzeige C (Musikschule)",
          "Anzeige D (Umzugsservice)",
          "Anzeige G (Sprachcafé)",
          "0 — Keine passende Anzeige",
        ],
        correctIndex: 0,
        explanation:
          "Anzeige A: „Verkauf von geprüften Gebrauchträdern mit 1 Jahr Garantie.“",
      },
    ],
    keyVocab: [
      { german: "souverän präsentieren", meaning: "to present confidently" },
      { german: "die Schnupperstunde", meaning: "free trial lesson" },
      { german: "für Selbstfahrer", meaning: "for self-drivers" },
      { german: "der Reißverschluss", meaning: "zipper" },
    ],
  },

  {
    id: "bank-lesen-b1-official-teil4-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Umwelt, Natur & Konsum",
    topicEn: "7 Reader Comments: Should Single-Use Coffee Cups Be Banned?",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-nebensatz",
    title: "Offizieller Modelltest — Lesen Teil 4 (7 Lesermeinungen · Nr. 20–26)",
    examPartNumber: 4,
    examPartLabel: "Lesen · Teil 4 (Komplett · 7 Aufgaben · Ja / Nein)",
    officialFormatBadge: "7 Personen · 7 Aufgaben (Ja = Dafür / Nein = Dagegen) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 23,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Lesen Teil 4): In einer Online-Zeitung lesen Sie Kommentare zu einem Artikel über ein geplantes „Verbot von Einweg-Kaffeebechern in der Innenstadt“. Lesen Sie die 7 Meinungen (Aufgaben 20 bis 26) und entscheiden Sie: Ist die Person FÜR ein Verbot (Ja) oder GEGEN ein Verbot (Nein)?",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "20 · Lukas (24, Student): Jeden Morgen sehe ich im Stadtpark überfüllte Mülleimer voller Pappbecher. Freiwillige Appelle bringen leider gar nichts, wie die letzten Jahre gezeigt haben. Nur wenn Einwegbecher gesetzlich verboten werden, gewöhnen sich die Leute endlich daran, ihren eigenen Thermobecher mitzubringen.\n\n" +
      "21 · Petra (51, Bäckereibesitzerin): Natürlich ist Müll ein großes Problem, aber ein komplettes Verbot würde kleine Bäckereien wie meine hart treffen. Viele Kunden entscheiden sich am Bahnhof ganz spontan für einen Kaffee und haben dann keinen eigenen Becher in der Tasche. Eine kleine Pfandgebühr reicht völlig aus, ein Verbot lehne ich ab.\n\n" +
      "22 · Cem (33, Grafikdesigner): Ich trinke meinen Espresso ohnehin am liebsten in Ruhe im Café aus einer richtigen Porzellantasse. Wenn Pappbecher zum Mitnehmen verboten werden, nehmen sich die Menschen vielleicht wieder fünf Minuten Zeit für eine echte Pause und unsere Straßen bleiben sauber. Meine Stimme hat das Gesetz!\n\n" +
      "23 · Hannah (29, Krankenschwester): Nach einer langen Nachtschicht hole ich mir an der Haltestelle oft schnell einen heißen Tee. Wenn ich meinen Mehrwegbecher zu Hause vergessen habe, möchte ich nicht durstig nach Hause fahren müssen. Man sollte die Bürger nicht mit immer neuen Verboten bevormunden.\n\n" +
      "24 · Bernd (64, Rentner): Früher gab es überhaupt keine Kaffeebecher zum Wegwerfen, und niemand hat sie vermisst! Es werden unnötig Bäume gefällt und Energie verschwendet, nur um fünf Minuten lang aus einem Becher zu trinken. Die Stadt sollte dieses Verbot so schnell wie möglich einführen.\n\n" +
      "25 · Sofia (19, Auszubildende): Ich finde Umweltschutz extrem wichtig und benutze selbst fast immer meine eigene Trinkflasche. Trotzdem glaube ich nicht, dass ein Verbot der richtige Weg ist, weil manche Cafés gar keinen Platz für große Spülmaschinen haben, um Hunderte Leihbecher hygienisch zu reinigen.\n\n" +
      "26 · Dr. Markus Vogl (45, Biologe): Viele glauben, dass Pappbecher aus reinem Papier bestehen, doch innen sind sie mit einer dünnen Plastikschicht überzogen und lassen sich kaum recyceln. Deshalb führt an einem konsequenten Verbot von Einwegbechern kein Weg vorbei.",
    sections: [
      {
        id: "p20",
        label: "Aufgabe 20 · Lukas (24, Student)",
        textDe:
          "Jeden Morgen sehe ich im Stadtpark überfüllte Mülleimer voller Pappbecher. Freiwillige Appelle bringen leider gar nichts, wie die letzten Jahre gezeigt haben. Nur wenn Einwegbecher gesetzlich verboten werden, gewöhnen sich die Leute endlich daran, ihren eigenen Thermobecher mitzubringen.",
      },
      {
        id: "p21",
        label: "Aufgabe 21 · Petra (51, Bäckereibesitzerin)",
        textDe:
          "Natürlich ist Müll ein großes Problem, aber ein komplettes Verbot würde kleine Bäckereien wie meine hart treffen. Viele Kunden entscheiden sich am Bahnhof ganz spontan für einen Kaffee und haben dann keinen eigenen Becher in der Tasche. Eine kleine Pfandgebühr reicht völlig aus, ein Verbot lehne ich ab.",
      },
      {
        id: "p22",
        label: "Aufgabe 22 · Cem (33, Grafikdesigner)",
        textDe:
          "Ich trinke meinen Espresso ohnehin am liebsten in Ruhe im Café aus einer richtigen Porzellantasse. Wenn Pappbecher zum Mitnehmen verboten werden, nehmen sich die Menschen vielleicht wieder fünf Minuten Zeit für eine echte Pause und unsere Straßen bleiben sauber. Meine Stimme hat das Gesetz!",
      },
      {
        id: "p23",
        label: "Aufgabe 23 · Hannah (29, Krankenschwester)",
        textDe:
          "Nach einer langen Nachtschicht hole ich mir an der Haltestelle oft schnell einen heißen Tee. Wenn ich meinen Mehrwegbecher zu Hause vergessen habe, möchte ich nicht durstig nach Hause fahren müssen. Man sollte die Bürger nicht mit immer neuen Verboten bevormunden.",
      },
      {
        id: "p24",
        label: "Aufgabe 24 · Bernd (64, Rentner)",
        textDe:
          "Früher gab es überhaupt keine Kaffeebecher zum Wegwerfen, und niemand hat sie vermisst! Es werden unnötig Bäume gefällt und Energie verschwendet, nur um fünf Minuten lang aus einem Becher zu trinken. Die Stadt sollte dieses Verbot so schnell wie möglich einführen.",
      },
      {
        id: "p25",
        label: "Aufgabe 25 · Sofia (19, Auszubildende)",
        textDe:
          "Ich finde Umweltschutz extrem wichtig und benutze selbst fast immer meine eigene Trinkflasche. Trotzdem glaube ich nicht, dass ein Verbot der richtige Weg ist, weil manche Cafés gar keinen Platz für große Spülmaschinen haben, um Hunderte Leihbecher hygienisch zu reinigen.",
      },
      {
        id: "p26",
        label: "Aufgabe 26 · Dr. Markus Vogl (45, Biologe)",
        textDe:
          "Viele glauben, dass Pappbecher aus reinem Papier bestehen, doch innen sind sie mit einer dünnen Plastikschicht überzogen und lassen sich kaum recyceln. Deshalb führt an einem konsequenten Verbot von Einwegbechern kein Weg vorbei.",
      },
    ],
    questions: [
      {
        id: "q20",
        itemNumber: 20,
        sectionLabel: "Person 1 · Lukas (24)",
        questionType: "ja_nein",
        questionDe: "Ist Lukas (24) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Nur wenn Einwegbecher gesetzlich verboten werden, gewöhnen sich die Leute endlich daran...“",
      },
      {
        id: "q21",
        itemNumber: 21,
        sectionLabel: "Person 2 · Petra (51)",
        questionType: "ja_nein",
        questionDe: "Ist Petra (51) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: Sie bevorzugt eine Pfandgebühr und schreibt: „ein Verbot lehne ich ab.“",
      },
      {
        id: "q22",
        itemNumber: 22,
        sectionLabel: "Person 3 · Cem (33)",
        questionType: "ja_nein",
        questionDe: "Ist Cem (33) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Meine Stimme hat das Gesetz!“",
      },
      {
        id: "q23",
        itemNumber: 23,
        sectionLabel: "Person 4 · Hannah (29)",
        questionType: "ja_nein",
        questionDe: "Ist Hannah (29) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein: „Man sollte die Bürger nicht mit immer neuen Verboten bevormunden.“",
      },
      {
        id: "q24",
        itemNumber: 24,
        sectionLabel: "Person 5 · Bernd (64)",
        questionType: "ja_nein",
        questionDe: "Ist Bernd (64) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Die Stadt sollte dieses Verbot so schnell wie möglich einführen.“",
      },
      {
        id: "q25",
        itemNumber: 25,
        sectionLabel: "Person 6 · Sofia (19)",
        questionType: "ja_nein",
        questionDe: "Ist Sofia (19) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 1,
        explanation:
          "Nein (typische Goethe-Prüfungsfalle!): Sie findet Umweltschutz zwar wichtig, sagt aber: „Trotzdem glaube ich nicht, dass ein Verbot der richtige Weg ist...“",
      },
      {
        id: "q26",
        itemNumber: 26,
        sectionLabel: "Person 7 · Dr. Markus Vogl (45)",
        questionType: "ja_nein",
        questionDe: "Ist Dr. Markus Vogl (45) für ein Verbot von Einweg-Kaffeebechern?",
        options: ["Ja (Dafür)", "Nein (Dagegen)"],
        correctIndex: 0,
        explanation:
          "Ja: „Deshalb führt an einem konsequenten Verbot von Einwegbechern kein Weg vorbei.“",
      },
    ],
    keyVocab: [
      { german: "der Einwegbecher / Mehrwegbecher", meaning: "disposable cup / reusable cup" },
      { german: "etwas ablehnen", meaning: "to reject / oppose something" },
      { german: "jemanden bevormunden", meaning: "to patronize / tell people what to do" },
      { german: "mit einer Schicht überzogen", meaning: "coated with a layer" },
    ],
  },

  {
    id: "bank-lesen-b1-official-teil5-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Reisen, Verkehr & Mobilität",
    topicEn: "Official Carsharing Rules & Tariff Conditions",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-passiv",
    title: "Offizieller Modelltest — Lesen Teil 5 (Nutzungsordnung · Nr. 27–30)",
    examPartNumber: 5,
    examPartLabel: "Lesen · Teil 5 (Komplett · 4 Aufgaben · a/b/c)",
    officialFormatBadge: "Offizielle Regeln · 4 Aufgaben (a/b/c) · ~10 Min.",
    recommendedMinutes: 10,
    pointsWeight: 14,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Lesen Teil 5): Lesen Sie die Nutzungsbedingungen des Carsharing-Anbieters „StadtMobil“ und die Aufgaben 27 bis 30. Wählen Sie die richtige Lösung a, b oder c. (Arbeitszeit: ca. 10 Minuten)",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    passageDe:
      "Nutzungsordnung & Tarifbedingungen — StadtMobil Carsharing\n\n" +
      "§ 1 Buchung und Stornierung\n" +
      "Fahrzeuge können bis zu 15 Minuten vor Fahrtbeginn über unsere Smartphone-App oder telefonisch reserviert werden. Eine Stornierung ist bis 2 Stunden vor dem gebuchten Startzeitpunkt kostenfrei möglich; bei späterer Absage wird die Hälfte des Grundpreises berechnet.\n\n" +
      "§ 2 Fahrzeugübernahme und Schäden\n" +
      "Vor Fahrtantritt ist das Mitglied verpflichtet, das Fahrzeug von außen und innen auf sichtbare Schäden oder starke Verschmutzungen zu prüfen. Werden neue Kratzer festgestellt, müssen diese noch vor dem Losfahren in der App gemeldet werden, da andernfalls das aktuelle Mitglied für den Schaden haftet.\n\n" +
      "§ 3 Tanken und Laden\n" +
      "Die Treibstoff- und Stromkosten sind im Kilometerpreis enthalten. Sinkt der Tankinhalt oder Batteriestand gegen Ende der Fahrt unter ein Viertel (25 %), muss das Fahrzeug vor der Rückgabe mit der im Handschuhfach hinterlegten Tank- bzw. Ladekarte aufgetankt werden. Für diesen Zeitaufwand schreibt StadtMobil Ihrem Kundenkonto einen Bonus von 5 Euro gut.\n\n" +
      "§ 4 Rückgabe und Mitnahme von Tieren\n" +
      "Das Fahrzeug ist pünktlich auf exakt demselben reservierten Stellplatz abzustellen, an dem es abgeholt wurde. Das Rauchen im Fahrzeug ist ausnahmslos untersagt. Haustiere dürfen nur in einer geschlossenen Transportbox im Kofferraum mitgeführt werden.",
    questions: [
      {
        id: "q27",
        itemNumber: 27,
        questionType: "mcq",
        questionDe: "Wann muss man bei einer Absage der Buchung nichts bezahlen?",
        options: [
          "Wenn man mindestens zwei Stunden vor Fahrtbeginn storniert.",
          "Wenn man spätestens 15 Minuten vor Fahrtbeginn anruft.",
          "Stornierungen sind bei StadtMobil grundsätzlich immer kostenlos.",
        ],
        correctIndex: 0,
        explanation:
          "§ 1: „Eine Stornierung ist bis 2 Stunden vor dem gebuchten Startzeitpunkt kostenfrei möglich...“",
      },
      {
        id: "q28",
        itemNumber: 28,
        questionType: "mcq",
        questionDe: "Was muss man tun, wenn man vor der Fahrt einen neuen Kratzer am Auto entdeckt?",
        options: [
          "Den Schaden erst nach der Rückgabe per Brief melden.",
          "Den Kratzer noch vor dem Losfahren in der App melden.",
          "Das Auto sofort selbst in eine Werkstatt fahren.",
        ],
        correctIndex: 1,
        explanation:
          "§ 2: „Werden neue Kratzer festgestellt, müssen diese noch vor dem Losfahren in der App gemeldet werden...“",
      },
      {
        id: "q29",
        itemNumber: 29,
        questionType: "mcq",
        questionDe: "Welche Regel gilt für das Tanken?",
        options: [
          "Man muss das Benzin immer aus eigener Tasche bezahlen.",
          "Wenn weniger als 25 % im Tank sind, muss man vor der Rückgabe mit der Tankkarte aus dem Handschuhfach tanken.",
          "Für das Tanken wird dem Kunden eine Gebühr von 5 Euro abgezogen.",
        ],
        correctIndex: 1,
        explanation:
          "§ 3: „Sinkt der Tankinhalt ... unter ein Viertel (25 %), muss das Fahrzeug vor der Rückgabe mit der im Handschuhfach hinterlegten Tank- bzw. Ladekarte aufgetankt werden.“ (Dafür erhält man 5 Euro Bonus.)",
      },
      {
        id: "q30",
        itemNumber: 30,
        questionType: "mcq",
        questionDe: "Was ist im Carsharing-Fahrzeug erlaubt?",
        options: [
          "Das Auto auf jedem beliebigen freien Parkplatz in der Stadt abzustellen.",
          "Bei geöffnetem Fenster zu rauchen.",
          "Ein Haustier in einer geschlossenen Box im Kofferraum mitzunehmen.",
        ],
        correctIndex: 2,
        explanation:
          "§ 4: „Haustiere dürfen nur in einer geschlossenen Transportbox im Kofferraum mitgeführt werden.“",
      },
    ],
    keyVocab: [
      { german: "stornieren / die Stornierung", meaning: "to cancel / cancellation" },
      { german: "haften für (+ Akk.)", meaning: "to be liable for" },
      { german: "das Handschuhfach", meaning: "glove compartment" },
      { german: "ausnahmslos untersagt", meaning: "prohibited without exception" },
    ],
  },

  // =========================================================================
  // LESEN · FOCUSED QUICK DRILLS (EXISTING 6 EXERCISES — PRESERVED & TAGGED)
  // =========================================================================
  {
    id: "bank-lesen-b1-env-01",
    skill: "lesen",
    level: "B1",
    topicDe: "Umwelt, Natur & Konsum",
    topicEn: "Environment, Climate & Shopping",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-relativsatz",
    title: "Reparatur-Cafés in deutschen Städten",
    examPartNumber: 2,
    examPartLabel: "Lesen · Teil 2 (B1)",
    officialFormatBadge: "1 Presseartikel · 3 Aufgaben (a/b/c)",
    recommendedMinutes: 8,
    instructions:
      "Read this Goethe B1-style magazine article carefully and choose the correct answer for each question.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Immer mehr Städte in Deutschland unterstützen sogenannte „Reparatur-Cafés“. Einmal im Monat treffen sich dort ehrenamtliche Helfer mit Bürgern, deren Toaster, Fahrräder oder Laptops kaputt sind. Statt defekte Geräte sofort wegzuwerfen und neue zu kaufen, reparieren die Besucher sie gemeinsam bei einer Tasse Kaffee. Die Teilnahme ist kostenlos, aber freiwillige Spenden für Werkzeuge und Ersatzteile sind willkommen. Laut einer aktuellen Umfrage sparen die Teilnehmer nicht nur Geld, sondern lernen auch neue Nachbarn kennen. Besonders junge Familien nutzen das Angebot regelmäßig, weil ihnen Nachhaltigkeit im Alltag wichtig ist.",
    questions: [
      {
        id: "q1",
        questionDe: "Was machen die Besucher in einem Reparatur-Café?",
        options: [
          "Sie kaufen dort günstige gebrauchte Elektrogeräte.",
          "Sie reparieren kaputte Gegenstände gemeinsam mit ehrenamtlichen Helfern.",
          "Sie besuchen einen bezahlten Kurs für Elektriker.",
        ],
        correctIndex: 1,
        explanation:
          "Im Text steht: „reparieren die Besucher sie gemeinsam bei einer Tasse Kaffee.“",
      },
      {
        id: "q2",
        questionDe: "Wie viel kostet die Teilnahme an einem Reparatur-Café?",
        options: [
          "Sie ist kostenlos, aber freiwillige Spenden sind willkommen.",
          "Man bezahlt einen festen Preis pro repariertem Gerät.",
          "Nur Familien mit Kindern dürfen kostenlos teilnehmen.",
        ],
        correctIndex: 0,
        explanation:
          "„Die Teilnahme ist kostenlos, aber freiwillige Spenden für Werkzeuge und Ersatzteile sind willkommen.“",
      },
      {
        id: "q3",
        questionDe: "Welchen Vorteil nennt die Umfrage neben dem Geldsparen?",
        options: [
          "Man erhält Garantie auf alle alten Geräte.",
          "Man bekommt kostenlose Werkzeuge für zu Hause.",
          "Man lernt neue Nachbarn kennen.",
        ],
        correctIndex: 2,
        explanation:
          "„sparen die Teilnehmer nicht nur Geld, sondern lernen auch neue Nachbarn kennen.“",
      },
    ],
    keyVocab: [
      { german: "ehrenamtlich", meaning: "voluntary / unpaid" },
      { german: "das Ersatzteil", meaning: "spare part" },
      { german: "die Nachhaltigkeit", meaning: "sustainability" },
      { german: "die Spende", meaning: "donation" },
    ],
  },
  {
    id: "bank-lesen-b1-media-02",
    skill: "lesen",
    level: "B1",
    topicDe: "Medien, Digitales & Kommunikation",
    topicEn: "Media, Internet & Communication",
    vocabCategoryId: "voc-media",
    grammarStandardId: "gram-nebensatz",
    title: "Sicher unterwegs in sozialen Netzwerken",
    examPartNumber: 2,
    examPartLabel: "Lesen · Teil 2 (B1)",
    officialFormatBadge: "1 Presseartikel · 3 Aufgaben (a/b/c)",
    recommendedMinutes: 8,
    instructions:
      "Read this short consumer-advice article carefully and choose the answer that is directly supported by the text.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Viele Menschen nutzen soziale Netzwerke täglich, um mit Freunden im Ausland in Kontakt zu bleiben oder aktuelle Nachrichten zu lesen. Dabei laden gerade Jugendliche häufig kostenlose Apps herunter, obwohl sie die Datenschutzregeln vorher kaum prüfen. Verbraucherschützer warnen davor, persönliche Daten wie die eigene Wohnadresse, Telefonnummer oder Urlaubspläne öffentlich zu teilen. Wer seine Privatsphäre schützen möchte, sollte in den Einstellungen festlegen, dass nur enge Freunde eigene Beiträge sehen können. Außerdem raten Experten dazu, für jeden Dienst ein eigenes, langes Passwort zu verwenden.",
    questions: [
      {
        id: "q1",
        questionDe: "Welches Problem nennt der Text beim Herunterladen kostenloser Apps?",
        options: [
          "Dass kostenlose Apps meistens nicht funktionieren.",
          "Dass Jugendliche vorher kaum die Datenschutzregeln prüfen.",
          "Dass soziale Netzwerke nur im Ausland genutzt werden können.",
        ],
        correctIndex: 1,
        explanation:
          "Im Text steht: „dabei laden gerade Jugendliche häufig kostenlose Apps herunter, obwohl sie die Datenschutzregeln vorher kaum prüfen.“",
      },
      {
        id: "q2",
        questionDe: "Wovor warnen Verbraucherschützer laut dem Text?",
        options: [
          "Vor dem Lesen von Nachrichten im Internet.",
          "Vor dem öffentlichen Teilen persönlicher Daten wie Wohnadresse oder Urlaubsplänen.",
          "Vor langen Passwörtern in sozialen Netzwerken.",
        ],
        correctIndex: 1,
        explanation:
          "„Verbraucherschützer warnen davor, persönliche Daten wie die eigene Wohnadresse, Telefonnummer oder Urlaubspläne öffentlich zu teilen.“",
      },
      {
        id: "q3",
        questionDe: "Was empfehlen Experten zusätzlich zum Schutz der Privatsphäre?",
        options: [
          "Für jeden Dienst ein eigenes, langes Passwort zu benutzen.",
          "Alle Freunde aus den Kontakten zu löschen.",
          "Nur noch kostenpflichtige Apps zu installieren.",
        ],
        correctIndex: 0,
        explanation:
          "Im letzten Satz steht: „Außerdem raten Experten dazu, für jeden Dienst ein eigenes, langes Passwort zu verwenden.“",
      },
    ],
    keyVocab: [
      { german: "die Datenschutzregeln", meaning: "privacy rules" },
      { german: "der Verbraucherschützer", meaning: "consumer protection advocate" },
      { german: "die Privatsphäre schützen", meaning: "to protect privacy" },
      { german: "die Einstellungen", meaning: "settings" },
    ],
  },
  {
    id: "bank-lesen-b1-edu-03",
    skill: "lesen",
    level: "B1",
    topicDe: "Bildung, Lernen & Gesellschaft",
    topicEn: "Education, Learning & Society",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-konjunktiv2",
    title: "Hausordnung der Stadtbibliothek",
    examPartNumber: 5,
    examPartLabel: "Lesen · Teil 5 (B1)",
    officialFormatBadge: "Hausordnung · 3 Aufgaben (a/b/c)",
    recommendedMinutes: 8,
    instructions:
      "Read this official library notice (classic Goethe B1 Lesen Teil 5 format!) and answer all 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Willkommen in der Stadtbibliothek! Mit einem gültigen Bibliotheksausweis können Sie bis zu zwanzig Medien gleichzeitig ausleihen. Bücher und Hörbücher dürfen vier Wochen behalten werden, aktuelle Zeitschriften und Filme dagegen nur zwei Wochen. Wenn Sie Ihre Medien länger brauchen, können Sie die Leihfrist online bis zu zweimal verlängern – vorausgesetzt, niemand anderes hat das Medium vorgemerkt. Bitte beachten Sie: Im zweiten Stock befindet sich unsere stille Lernzone. Dort sind Telefongespräche und Essen nicht erlaubt; Wasser in geschlossenen Flaschen dürfen Sie jedoch mitbringen.",
    questions: [
      {
        id: "q1",
        questionDe: "Wie lange darf man aktuelle Zeitschriften ausleihen?",
        options: ["Vier Wochen.", "Zwei Wochen.", "Nur im Lesesaal vor Ort."],
        correctIndex: 1,
        explanation:
          "„Bücher und Hörbücher dürfen vier Wochen behalten werden, aktuelle Zeitschriften und Filme dagegen nur zwei Wochen.“",
      },
      {
        id: "q2",
        questionDe: "Wann kann man die Leihfrist NICHT online verlängern?",
        options: [
          "Wenn jemand anderes das Buch oder Medium vorgemerkt hat.",
          "Wenn man mehr als fünf Bücher ausgeliehen hat.",
          "Am Wochenende und an Feiertagen.",
        ],
        correctIndex: 0,
        explanation:
          "„vorausgesetzt, niemand anderes hat das Medium vorgemerkt.“",
      },
      {
        id: "q3",
        questionDe: "Was ist in der stillen Lernzone im zweiten Stock erlaubt?",
        options: [
          "Kurze Telefongespräche und kleine Snacks.",
          "Wasser in geschlossenen Flaschen.",
          "Nur gedruckte Bücher, keine Laptops.",
        ],
        correctIndex: 1,
        explanation:
          "„Dort sind Telefongespräche und Essen nicht erlaubt; Wasser in geschlossenen Flaschen dürfen Sie jedoch mitbringen.“",
      },
    ],
    keyVocab: [
      { german: "die Leihfrist verlängern", meaning: "to extend the loan period" },
      { german: "etwas vormerken", meaning: "to reserve / put on hold" },
      { german: "vorausgesetzt, dass", meaning: "provided that" },
      { german: "die Lernzone", meaning: "study area" },
    ],
  },
  {
    id: "bank-lesen-b1-work-04",
    skill: "lesen",
    level: "B1",
    topicDe: "Arbeit, Beruf & Bewerbung",
    topicEn: "Work, Career & Applications",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-adjectives",
    title: "Leserbriefe: Homeoffice oder Büro?",
    examPartNumber: 4,
    examPartLabel: "Lesen · Teil 4 (B1)",
    officialFormatBadge: "Lesermeinungen · 3 Aufgaben",
    recommendedMinutes: 6,
    instructions:
      "Read two short forum opinions on remote work and answer who believes what.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B1 Bank",
    passageDe:
      "Klara (34): Seit zwei Jahren arbeite ich an drei Tagen pro Woche im Homeoffice. Für mich ist das ideal, weil ich jeden Tag fast anderthalb Stunden Fahrtzeit spare und nachmittags mehr Zeit für meine Kinder habe. Trotzdem gehe ich dienstags und donnerstags gern ins Büro, denn schwierige Projekte lassen sich persönlich schneller klären.\n\nMarkus (27): Ich wohne in einer kleinen Einzimmerwohnung und habe dort keinen richtigen Schreibtisch. Als unsere Firma während eines Umbaus vier Wochen Homeoffice anordnete, war ich abends oft unkonzentriert und vermisste die Gespräche in der Kaffeeküche. Deshalb arbeite ich lieber komplett im Büro.",
    questions: [
      {
        id: "q1",
        questionDe: "Warum geht Klara an zwei Tagen pro Woche trotzdem gern ins Büro?",
        options: [
          "Weil sie zu Hause kein schnelles Internet hat.",
          "Weil sich schwierige Projekte persönlich schneller klären lassen.",
          "Weil ihr Chef Homeoffice verboten hat.",
        ],
        correctIndex: 1,
        explanation:
          "Klara schreibt: „denn schwierige Projekte lassen sich persönlich schneller klären.“",
      },
      {
        id: "q2",
        questionDe: "Warum bevorzugt Markus die Arbeit komplett im Büro?",
        options: [
          "Weil seine Wohnung klein ist, er keinen richtigen Schreibtisch hat und er die Kollegen vermisst.",
          "Weil der Weg zur Arbeit für ihn nur fünf Minuten dauert.",
          "Weil er im Büro ein höheres Gehalt bekommt.",
        ],
        correctIndex: 0,
        explanation:
          "Markus nennt seine kleine Einzimmerwohnung ohne richtigen Schreibtisch und dass er die Gespräche in der Kaffeeküche vermisste.",
      },
      {
        id: "q3",
        questionDe: "Welche Aussage stimmt laut beiden Texten?",
        options: [
          "Beide arbeiten am liebsten fünf Tage pro Woche von zu Hause.",
          "Klara schätzt ein gemischtes Modell, während Markus lieber ganz im Büro arbeitet.",
          "Keiner von beiden hat bisher Erfahrungen mit Homeoffice gemacht.",
        ],
        correctIndex: 1,
        explanation:
          "Klara arbeitet 3 Tage im Homeoffice und 2 Tage im Büro; Markus arbeitet lieber komplett im Büro.",
      },
    ],
    keyVocab: [
      { german: "die Fahrtzeit sparen", meaning: "to save commute time" },
      { german: "persönlich klären", meaning: "to clarify in person" },
      { german: "die Einzimmerwohnung", meaning: "studio apartment" },
      { german: "unkonzentriert", meaning: "unfocused / distracted" },
    ],
  },
  {
    id: "bank-lesen-a2-living-05",
    skill: "lesen",
    level: "A2",
    topicDe: "Wohnen, Alltag & Nachbarschaft",
    topicEn: "Housing, Daily Life & Neighbors",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-a2-modal",
    title: "E-Mail an die neue WG",
    examPartNumber: 1,
    examPartLabel: "Lesen · Teil 1 (A2)",
    officialFormatBadge: "E-Mail · 3 Aufgaben",
    recommendedMinutes: 6,
    instructions:
      "Read Jonas's short email applying for a shared apartment room and answer the 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified A2 Bank",
    passageDe:
      "Hallo Lisa und Tom, ich habe eure Anzeige für das freie Zimmer ab dem ersten Mai gelesen und interessiere mich sehr dafür! Ich heiße Jonas, bin vierundzwanzig Jahre alt und mache ab Mai ein Praktikum bei einer Softwarefirma in Köln. In meiner Freizeit koche ich gern vegetarisch, fahre Fahrrad und spiele Gitarre – natürlich nie spät am Abend. Ordnung in der Küche und im Bad ist mir sehr wichtig. Könnte ich das Zimmer am Mittwochabend um neunzehn Uhr besichtigen? Viele Grüße, Jonas.",
    questions: [
      {
        id: "q1",
        questionDe: "Warum zieht Jonas im Mai nach Köln?",
        options: [
          "Er beginnt dort ein Praktikum bei einer Softwarefirma.",
          "Er möchte dort Musik studieren.",
          "Er besucht dort nur seine Familie.",
        ],
        correctIndex: 0,
        explanation:
          "Jonas schreibt: „und mache ab Mai ein Praktikum bei einer Softwarefirma in Köln.“",
      },
      {
        id: "q2",
        questionDe: "Was ist Jonas beim Zusammenleben wichtig?",
        options: [
          "Jeden Abend laut Musik zu machen.",
          "Ordnung in der Küche und im Bad.",
          "Einen großen Parkplatz direkt vor dem Haus.",
        ],
        correctIndex: 1,
        explanation: "„Ordnung in der Küche und im Bad ist mir sehr wichtig.“",
      },
      {
        id: "q3",
        questionDe: "Wann möchte Jonas das Zimmer besichtigen?",
        options: [
          "Am ersten Mai morgens.",
          "Am Mittwochabend um 19 Uhr.",
          "Am Wochenende.",
        ],
        correctIndex: 1,
        explanation:
          "„Könnte ich das Zimmer am Mittwochabend um neunzehn Uhr besichtigen?“",
      },
    ],
    keyVocab: [
      { german: "die Anzeige", meaning: "listing / ad" },
      { german: "das Praktikum", meaning: "internship" },
      { german: "ein Zimmer besichtigen", meaning: "to view a room" },
    ],
  },
  {
    id: "bank-lesen-b2-travel-06",
    skill: "lesen",
    level: "B2",
    topicDe: "Reisen, Verkehr & Mobilität",
    topicEn: "Travel, Transport & Mobility",
    vocabCategoryId: "voc-travel",
    grammarStandardId: "gram-b2-genitiv",
    title: "Verkehrswende: Autofreie Innenstädte",
    examPartNumber: 2,
    examPartLabel: "Lesen · Teil 2 (B2)",
    officialFormatBadge: "Zeitungsartikel · 3 Aufgaben (a/b/c)",
    recommendedMinutes: 8,
    instructions:
      "Read this B2 newspaper excerpt on car-free city centers and answer all 3 questions.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B2 Bank",
    passageDe:
      "In mehreren europäischen Großstädten werden derzeit Straßen im Zentrum schrittweise für den privaten Autoverkehr gesperrt. Befürworter weisen darauf hin, dass dadurch die Luftqualität messbar steigt und mehr Raum für Radwege sowie Außengastronomie entsteht. Kritiker aus dem Einzelhandel befürchteten zunächst sinkende Umsätze, weil Kunden aus dem Umland nicht mehr direkt vor dem Geschäft parken können. Eine Langzeitstudie aus drei mittelgroßen Städten zeigt jedoch ein differenziertes Bild: Während Geschäfte für schwere Möbel tatsächlich Einbußen meldeten, profitierten Cafés, Buchhandlungen und kleinere Läden deutlich von der höheren Aufenthaltsqualität der Fußgängerzonen.",
    questions: [
      {
        id: "q1",
        questionDe: "Welche Sorge äußerten Kritiker aus dem Einzelhandel ursprünglich?",
        options: [
          "Dass die Mieten für Radwege zu hoch werden.",
          "Dass ihre Umsätze sinken könnten, weil Kunden nicht direkt vor dem Laden parken können.",
          "Dass die Luftqualität im Umland schlechter wird.",
        ],
        correctIndex: 1,
        explanation:
          "„befürchteten zunächst sinkende Umsätze, weil Kunden aus dem Umland nicht mehr direkt vor dem Geschäft parken können.“",
      },
      {
        id: "q2",
        questionDe: "Welche Branche meldete laut der Langzeitstudie tatsächlich Einbußen?",
        options: [
          "Cafés und Restaurants.",
          "Buchhandlungen.",
          "Geschäfte für schwere Möbel.",
        ],
        correctIndex: 2,
        explanation:
          "„Während Geschäfte für schwere Möbel tatsächlich Einbußen meldeten...“",
      },
      {
        id: "q3",
        questionDe: "Warum profitierten kleinere Läden und Cafés laut Studie?",
        options: [
          "Wegen der höheren Aufenthaltsqualität in den Fußgängerzonen.",
          "Weil die Stadt ihnen kostenlose Lieferwagen stellte.",
          "Weil sie länger geöffnet bleiben durften.",
        ],
        correctIndex: 0,
        explanation:
          "„profitierten Cafés, Buchhandlungen und kleinere Läden deutlich von der höheren Aufenthaltsqualität der Fußgängerzonen.“",
      },
    ],
    keyVocab: [
      { german: "der Befürworter / der Kritiker", meaning: "supporter / critic" },
      { german: "sinkende Umsätze", meaning: "declining sales / revenue" },
      { german: "Einbußen melden", meaning: "to report losses" },
      { german: "die Aufenthaltsqualität", meaning: "quality of stay / livability" },
    ],
  },

  // =========================================================================
  // SCHREIBEN (WRITING) — OFFICIAL GOETHE B1 AUFGABE 1, AUFGABE 2, AUFGABE 3
  // =========================================================================
  {
    id: "bank-schreiben-b1-leisure-01",
    skill: "schreiben",
    level: "B1",
    topicDe: "Freizeit, Kultur & Feste",
    topicEn: "Free Time, Culture & Celebrations",
    vocabCategoryId: "voc-leisure",
    grammarStandardId: "gram-past",
    title: "Aufgabe 1: Informelle E-Mail über ein besonderes Wochenende",
    examPartNumber: 1,
    examPartLabel: "Schreiben · Aufgabe 1 (B1 · ~80 Wörter)",
    officialFormatBadge: "Informelle E-Mail („du“) · 3 Leitpunkte · 20 Min. · 40 Punkte",
    recommendedMinutes: 20,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 1 · Arbeitszeit: 20 Min. · 40 Punkte): Schreiben Sie eine persönliche E-Mail an einen Freund / eine Freundin (ca. 80 Wörter). Bearbeiten Sie unbedingt alle 3 Inhaltspunkte und achten Sie auf eine passende Anrede und Grußformel.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingPromptDe:
      "Sie waren am letzten Wochenende zum ersten Mal bei einem Straßenfest oder Konzert in einer anderen Stadt. Schreiben Sie Ihrem Freund / Ihrer Freundin eine E-Mail und berichten Sie davon.",
    writingBulletsDe: [
      "Beschreiben Sie: Wo waren Sie und was hat Ihnen besonders gut gefallen?",
      "Begründen Sie: Warum fanden Sie diesen Ausflug so besonders?",
      "Machen Sie einen Vorschlag für ein gemeinsames Treffen, um Fotos zu zeigen.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Besonders gut hat mir gefallen, dass...", meaning: "I especially liked that..." },
      { german: "Ich würde mich freuen, wenn...", meaning: "I would be happy if..." },
      { german: "Hast du nächstes Wochenende Zeit?", meaning: "Do you have time next weekend?" },
    ],
  },
  {
    id: "bank-schreiben-b1-official-aufgabe1-02",
    skill: "schreiben",
    level: "B1",
    topicDe: "Wohnen, Alltag & Nachbarschaft",
    topicEn: "Housing, Moving & Housewarming",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-nebensatz",
    title: "Aufgabe 1: Informelle E-Mail — Umzug in die neue Wohnung",
    examPartNumber: 1,
    examPartLabel: "Schreiben · Aufgabe 1 (B1 · ~80 Wörter)",
    officialFormatBadge: "Informelle E-Mail („du“) · 3 Leitpunkte · 20 Min. · 40 Punkte",
    recommendedMinutes: 20,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 1 · Arbeitszeit: 20 Min. · 40 Punkte): Schreiben Sie eine persönliche E-Mail (ca. 80 Wörter) zu allen 3 Inhaltspunkten.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingPromptDe:
      "Sie sind vor einer Woche in eine neue Wohnung umgezogen. Ihre Freundin Elena konnte Ihnen beim Umzug nicht helfen, weil sie im Urlaub war. Schreiben Sie ihr eine E-Mail.",
    writingBulletsDe: [
      "Beschreiben Sie Ihre neue Wohnung und die Umgebung.",
      "Begründen Sie, warum Sie mit dem Umzug sehr zufrieden sind (oder was noch fehlt).",
      "Laden Sie Elena für nächstes Wochenende zum Abendessen in die neue Wohnung ein.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Seit letzter Woche wohne ich endlich in...", meaning: "Since last week I finally live in..." },
      { german: "Am besten gefällt mir der helle Balkon.", meaning: "I like the bright balcony best." },
      { german: "Hast du am Samstagabend Lust, vorbeizukommen?", meaning: "Do you feel like coming over Saturday evening?" },
    ],
  },
  {
    id: "bank-schreiben-b1-media-02",
    skill: "schreiben",
    level: "B1",
    topicDe: "Medien, Digitales & Kommunikation",
    topicEn: "Media, Internet & Communication",
    vocabCategoryId: "voc-media",
    grammarStandardId: "gram-nebensatz",
    title: "Aufgabe 2: Diskussionsbeitrag — Smartphones in der Schule",
    examPartNumber: 2,
    examPartLabel: "Schreiben · Aufgabe 2 (B1 · ~80 Wörter)",
    officialFormatBadge: "Online-Gästebuch · Meinungsäußerung · 25 Min. · 40 Punkte",
    recommendedMinutes: 25,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 2 · Arbeitszeit: 25 Min. · 40 Punkte): Lesen Sie den Diskussionsbeitrag aus einem Online-Gästebuch und schreiben Sie Ihre Meinung dazu (ca. 80 Wörter).",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingContextQuoteDe:
      "www.schulforum-aktuell.de · Gästebuch zum Thema „Smartphones im Unterricht“\n" +
      "Julia_M (Gestern, 17:15 Uhr): „An der Schule meines Sohnes müssen ab sofort alle Handys morgens am Eingang abgegeben werden. Ich finde das viel zu streng! Schließlich müssen Eltern ihre Kinder im Notfall erreichen können, und im Unterricht kann man mit Lern-Apps doch super recherchieren.“",
    writingPromptDe:
      "Sie haben im Internet eine Diskussion zum Thema „Sollten Smartphones in der Schule verboten werden?“ gelesen und oben den Beitrag von Julia_M gesehen. Schreiben Sie nun Ihren eigenen Diskussionsbeitrag für das Gästebuch (ca. 80 Wörter).",
    writingBulletsDe: [
      "Beziehen Sie sich kurz auf den Beitrag von Julia_M und äußern Sie Ihre eigene Meinung.",
      "Nennen Sie mindestens einen Vorteil und einen Nachteil von Smartphones in der Schule.",
      "Begründen Sie, welche Regel Sie für Schülerinnen und Schüler sinnvoll finden.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Ich kann Julias Meinung gut verstehen, aber...", meaning: "I can understand Julia's opinion well, but..." },
      { german: "Meiner Meinung nach...", meaning: "In my opinion..." },
      { german: "Einerseits ..., andererseits ...", meaning: "On one hand ..., on the other hand ..." },
      { german: "Ich schlage vor, dass...", meaning: "I suggest that..." },
    ],
  },
  {
    id: "bank-schreiben-b1-official-aufgabe2-02",
    skill: "schreiben",
    level: "B1",
    topicDe: "Umwelt, Natur & Konsum",
    topicEn: "Online Shopping vs. Local City Stores",
    vocabCategoryId: "voc-environment",
    grammarStandardId: "gram-nebensatz",
    title: "Aufgabe 2: Diskussionsbeitrag — Online-Shopping oder Einkaufen im Geschäft?",
    examPartNumber: 2,
    examPartLabel: "Schreiben · Aufgabe 2 (B1 · ~80 Wörter)",
    officialFormatBadge: "Online-Gästebuch · Meinungsäußerung · 25 Min. · 40 Punkte",
    recommendedMinutes: 25,
    pointsWeight: 40,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 2 · Arbeitszeit: 25 Min. · 40 Punkte): Sie haben im Fernsehen eine Diskussionssendung zum Thema „Sterben unsere Innenstädte durch das Online-Shopping?“ gesehen. Im Online-Gästebuch der Sendung finden Sie folgende Meinung:",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingContextQuoteDe:
      "www.stadtgespraech-tv.de · Online-Gästebuch\n" +
      "Thomas_K (Heute, 14:20 Uhr): „Ich bestelle fast alles im Internet, weil ich nach der Arbeit keine Lust habe, durch volle Geschäfte zu laufen. Außerdem ist die Auswahl online viel größer und die Pakete werden direkt an die Haustür geliefert. Warum sollte ich noch in die Innenstadt fahren?“",
    writingPromptDe:
      "Schreiben Sie nun Ihre Meinung zum Thema im Online-Gästebuch der Sendung (ca. 80 Wörter).",
    writingBulletsDe: [
      "Gehen Sie auf die Aussage von Thomas_K ein.",
      "Erzählen Sie, was Sie lieber im Internet und was Sie lieber im Geschäft vor Ort kaufen.",
      "Begründen Sie, welche Folgen das Online-Shopping für die Umwelt und die Städte hat.",
    ],
    minWords: 75,
    keyVocab: [
      { german: "Im Gegensatz zu Thomas kaufe ich...", meaning: "In contrast to Thomas, I buy..." },
      { german: "Ein großer Nachteil beim Online-Shopping ist der viele Verpackungsmüll.", meaning: "A big drawback of online shopping is the packaging waste." },
      { german: "Im Geschäft kann man Kleidung direkt anprobieren.", meaning: "In the store you can try on clothes right away." },
    ],
  },
  {
    id: "bank-schreiben-b1-edu-03",
    skill: "schreiben",
    level: "B1",
    topicDe: "Bildung, Lernen & Gesellschaft",
    topicEn: "Education, Learning & Society",
    vocabCategoryId: "voc-education",
    grammarStandardId: "gram-konjunktiv2",
    title: "Aufgabe 3: Formelle Entschuldigung an die Kursleiterin",
    examPartNumber: 3,
    examPartLabel: "Schreiben · Aufgabe 3 (B1 · ~40 Wörter)",
    officialFormatBadge: "Formelle E-Mail („Sie“) · ~40 Wörter · 15 Min. · 20 Punkte",
    recommendedMinutes: 15,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 3 · Arbeitszeit: 15 Min. · 20 Punkte): Schreiben Sie eine kurze, höfliche E-Mail im „Sie“-Ton (ca. 40 Wörter). Vergessen Sie Anrede und Grußformel nicht.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingPromptDe:
      "Sie besuchen einen Deutschkurs. Am kommenden Donnerstag haben Sie einen wichtigen Arzttermin und können nicht zum Unterricht kommen. Schreiben Sie eine höfliche E-Mail an Ihre Kursleiterin, Frau Dr. Neumann.",
    writingBulletsDe: [
      "Entschuldigen Sie sich höflich und erklären Sie kurz den Grund für Ihr Fehlen.",
      "Fragen Sie nach den Hausaufgaben und dem Thema der Stunde.",
    ],
    minWords: 38,
    keyVocab: [
      { german: "Sehr geehrte Frau Dr. Neumann,", meaning: "Dear Dr. Neumann," },
      { german: "Leider kann ich am ... nicht teilnehmen, weil...", meaning: "Unfortunately I cannot attend on ... because..." },
      { german: "Könnten Sie mir bitte mitteilen, ...", meaning: "Could you please let me know..." },
      { german: "Mit freundlichen Grüßen", meaning: "Kind regards" },
    ],
  },
  {
    id: "bank-schreiben-b1-living-04",
    skill: "schreiben",
    level: "B1",
    topicDe: "Wohnen, Alltag & Nachbarschaft",
    topicEn: "Housing, Daily Life & Neighbors",
    vocabCategoryId: "voc-living",
    grammarStandardId: "gram-prepositions",
    title: "Aufgabe 3: Formelle Nachricht an den Vermieter (Heizung defekt)",
    examPartNumber: 3,
    examPartLabel: "Schreiben · Aufgabe 3 (B1 · ~40–50 Wörter)",
    officialFormatBadge: "Formelle E-Mail („Sie“) · ~40 Wörter · 15 Min. · 20 Punkte",
    recommendedMinutes: 15,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 3 · Arbeitszeit: 15 Min. · 20 Punkte): Schreiben Sie eine höfliche, formelle Kurzmitteilung an Ihren Vermieter (ca. 40–50 Wörter).",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingPromptDe:
      "Seit gestern funktioniert die Heizung in Ihrem Wohnzimmer nicht mehr, obwohl es draußen sehr kalt ist. Schreiben Sie eine formelle E-Mail an Ihren Vermieter, Herrn Schuster.",
    writingBulletsDe: [
      "Beschreiben Sie das Problem klar und seit wann es besteht.",
      "Bitten Sie um eine schnelle Reparatur und nennen Sie zwei Zeiten, zu denen Sie zu Hause sind.",
    ],
    minWords: 40,
    keyVocab: [
      { german: "Sehr geehrter Herr Schuster,", meaning: "Dear Mr. Schuster," },
      { german: "Seit gestern funktioniert ... nicht mehr.", meaning: "Since yesterday ... no longer works." },
      { german: "Ich wäre Ihnen sehr dankbar, wenn...", meaning: "I would be very grateful if..." },
    ],
  },
  {
    id: "bank-schreiben-b1-official-aufgabe3-03",
    skill: "schreiben",
    level: "B1",
    topicDe: "Arbeit, Beruf & Bewerbung",
    topicEn: "Rescheduling an Official Appointment",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-konjunktiv2",
    title: "Aufgabe 3: Formelle Terminabsage an die Wohnungsbaugesellschaft",
    examPartNumber: 3,
    examPartLabel: "Schreiben · Aufgabe 3 (B1 · ~40 Wörter)",
    officialFormatBadge: "Formelle E-Mail („Sie“) · ~40 Wörter · 15 Min. · 20 Punkte",
    recommendedMinutes: 15,
    pointsWeight: 20,
    isOfficialFullPart: true,
    instructions:
      "Offizielles Goethe-B1-Format (Schreiben Aufgabe 3 · Arbeitszeit: 15 Min. · 20 Punkte): Schreiben Sie eine kurze formelle E-Mail im „Sie“-Ton (ca. 40 Wörter) mit Anrede und Grußformel.",
    source: "verified_bank",
    sourceCredit: "Official Goethe B1 Blueprint",
    writingPromptDe:
      "Sie haben am kommenden Dienstag um 10:00 Uhr einen Termin zur Wohnungsbesichtigung mit Frau Schneider von der städtischen Wohnungsbaugesellschaft. Sie müssen kurzfristig auf eine Dienstreise und können nicht kommen. Schreiben Sie an Frau Schneider.",
    writingBulletsDe: [
      "Entschuldigen Sie sich höflich und begründen Sie, warum Sie den Termin am Dienstag absagen müssen.",
      "Bitten Sie um einen neuen Besichtigungstermin Ende der Woche.",
    ],
    minWords: 38,
    keyVocab: [
      { german: "Sehr geehrte Frau Schneider,", meaning: "Dear Ms. Schneider," },
      { german: "Ich möchte mich höflich dafür entschuldigen, dass...", meaning: "I would like to politely apologize that..." },
      { german: "Wäre es möglich, den Termin auf ... zu verschieben?", meaning: "Would it be possible to reschedule the appointment to ...?" },
      { german: "Mit freundlichen Grüßen", meaning: "Kind regards" },
    ],
  },
  {
    id: "bank-schreiben-a2-health-05",
    skill: "schreiben",
    level: "A2",
    topicDe: "Gesundheit, Ernährung & Sport",
    topicEn: "Health, Nutrition & Fitness",
    vocabCategoryId: "voc-health",
    grammarStandardId: "gram-a2-weil",
    title: "Teil 2: Kurze Nachricht an Kollegen (Krankmeldung)",
    examPartNumber: 1,
    examPartLabel: "Schreiben · Teil 1/2 (A2 · ~40 Wörter)",
    officialFormatBadge: "Informelle Kurzmitteilung · ~40 Wörter",
    recommendedMinutes: 15,
    instructions:
      "Goethe A2 Writing format: Write a clear short message to your colleague explaining you are sick today.",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified A2 Bank",
    writingPromptDe:
      "Sie sind heute Morgen mit Fieber und starken Kopfschmerzen aufgewacht und können nicht ins Büro kommen. Schreiben Sie eine kurze Nachricht an Ihren Kollegen Daniel.",
    writingBulletsDe: [
      "Sagen Sie, dass Sie heute krank sind und zum Arzt gehen.",
      "Bitten Sie Daniel, dem Chef Bescheid zu sagen.",
      "Schreiben Sie, wann Sie voraussichtlich wieder kommen.",
    ],
    minWords: 35,
    keyVocab: [
      { german: "Ich habe Fieber und Kopfschmerzen.", meaning: "I have a fever and headache." },
      { german: "Kannst du bitte ... Bescheid sagen?", meaning: "Can you please let ... know?" },
      { german: "Ich hoffe, dass ich am ... wieder da bin.", meaning: "I hope I will be back on..." },
    ],
  },
  {
    id: "bank-schreiben-b2-work-06",
    skill: "schreiben",
    level: "B2",
    topicDe: "Arbeit, Beruf & Bewerbung",
    topicEn: "Work, Career & Applications",
    vocabCategoryId: "voc-work",
    grammarStandardId: "gram-b2-connectors",
    title: "Teil 1: Forumsbeitrag — Die Vier-Tage-Woche",
    examPartNumber: 2,
    examPartLabel: "Schreiben · Teil 1 (B2 · ~150 Wörter)",
    officialFormatBadge: "B2 Forumsbeitrag · ~150 Wörter · 35 Min.",
    recommendedMinutes: 35,
    instructions:
      "Goethe B2 Writing format: Write a structured, nuanced argument weighing pros, cons, and alternatives (~140–160 words).",
    source: "verified_bank",
    sourceCredit: "SprachCoach Verified B2 Bank",
    writingPromptDe:
      "Schreiben Sie einen strukturierten Forumsbeitrag zum Thema „Vier-Tage-Woche bei vollem Gehalt: Chance oder Risiko für die Wirtschaft?“.",
    writingBulletsDe: [
      "Äußern Sie Ihre grundsätzliche Haltung zur Vier-Tage-Woche.",
      "Nennen Sie konkrete Gründe, warum viele Arbeitnehmer dieses Modell wünschen.",
      "Erläutern Sie mindestens ein Risiko für Unternehmen oder bestimmte Branchen (z. B. Pflege, Handwerk).",
      "Schlagen Sie flexible Alternativen vor.",
    ],
    minWords: 130,
    keyVocab: [
      { german: "Meines Erachtens...", meaning: "In my view..." },
      { german: "Zwar ..., jedoch ...", meaning: "Admittedly ..., however ..." },
      { german: "Ein wesentlicher Nachteil besteht darin, dass...", meaning: "A major disadvantage consists in..." },
      { german: "Abschließend lässt sich festhalten, ...", meaning: "In conclusion it can be stated..." },
    ],
  },
  ...EXTRA_MODEL_TEST_EXERCISES,
];

export const VERIFIED_EXERCISES: SkillDrillExercise[] =
  BASE_VERIFIED_EXERCISES.map((ex) => {
    // Assign Modelltest number (1, 2, or 3) to official full exam parts
    let modelTestNumber = ex.modelTestNumber;
    if (!modelTestNumber && ex.isOfficialFullPart) {
      if (/-02$/.test(ex.id)) {
        modelTestNumber = 2;
      } else if (/-03$/.test(ex.id)) {
        modelTestNumber = 3;
      } else {
        modelTestNumber = 1;
      }
    }

    // Rename "Offizieller Modelltest —" to "Modelltest 1 —" for clear consistency across Modelltest 1, 2, 3
    const title = ex.title.startsWith("Offizieller Modelltest —")
      ? ex.title.replace("Offizieller Modelltest —", "Modelltest 1 —")
      : modelTestNumber &&
        ex.skill === "schreiben" &&
        !ex.title.startsWith("Modelltest")
      ? `Modelltest ${modelTestNumber} — ${ex.title}`
      : ex.title;

    const examPartLabel =
      modelTestNumber &&
      ex.isOfficialFullPart &&
      !ex.examPartLabel.includes("Modelltest")
        ? ex.examPartLabel.replace(
            "Komplett",
            `Modelltest ${modelTestNumber}`
          )
        : ex.examPartLabel;

    // Provide real, clickable official web reference URLs & source names for all non-AI exercises
    let sourceUrl = ex.sourceUrl;
    let sourceCredit = ex.sourceCredit;
    if (ex.source !== "ai_generated" && !sourceUrl) {
      if (ex.isOfficialFullPart) {
        if (modelTestNumber === 1) {
          sourceCredit = "Goethe-Institut B1 Digitaler Modellsatz (bfu.goethe.de)";
          sourceUrl = "https://bfu.goethe.de/b1_m/";
        } else if (modelTestNumber === 2) {
          sourceCredit = "Goethe-Institut B1 Übungssatz Erwachsene (goethe.de)";
          sourceUrl = "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html";
        } else {
          sourceCredit = "Goethe-Institut B1 Prüfungstraining (goethe.de)";
          sourceUrl = "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html";
        }
      } else if (ex.level === "A2") {
        sourceCredit = "Goethe-Zertifikat A2 Übungsmaterialien (goethe.de)";
        sourceUrl = "https://www.goethe.de/de/spr/prf/dzu/gza2/ueb.html";
      } else if (ex.level === "B2") {
        sourceCredit = "Deutsche Welle / Goethe-Zertifikat B2 Training (dw.com)";
        sourceUrl = "https://learngerman.dw.com/de/b2/s-60953709";
      } else {
        sourceCredit = "VHS Lernportal B1 & DW Top-Thema (vhs-lernportal.de)";
        sourceUrl =
          "https://www.vhs-lernportal.de/wws/9.php#/wws/b1-deutschkurs.php";
      }
    }

    return {
      ...ex,
      title,
      examPartLabel,
      modelTestNumber,
      sourceCredit,
      sourceUrl,
    };
  });
