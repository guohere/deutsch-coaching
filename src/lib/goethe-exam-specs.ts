import { ExamSkill, SkillDrillExercise } from "./types";

export interface GoethePartSpec {
  partNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string; // e.g. "Teil 1" or "Aufgabe 1"
  titleDe: string;
  titleEn: string;
  textGenreDe: string;
  questionFormatDe: string;
  itemCountLabel: string; // e.g. "10 Aufgaben (Nr. 1–10)"
  itemCount: number;
  listenCount?: 1 | 2;
  listenBadgeDe?: string;
  recommendedMinutes: number;
  points: number;
  examTip: string;
}

export interface GoetheModuleBlueprint {
  skill: ExamSkill;
  moduleTitleDe: string;
  moduleTitleEn: string;
  totalMinutes: number;
  totalItemsLabel: string;
  passingScoreLabel: string;
  overviewDe: string;
  parts: GoethePartSpec[];
}

export const GOETHE_B1_BLUEPRINT: Record<ExamSkill, GoetheModuleBlueprint> = {
  hoeren: {
    skill: "hoeren",
    moduleTitleDe: "Modul Hören (Goethe-Zertifikat B1)",
    moduleTitleEn: "Official Goethe B1 Listening Exam",
    totalMinutes: 40,
    totalItemsLabel: "4 Teile · 30 Aufgaben insgesamt",
    passingScoreLabel: "Bestehen ab 60% (mind. 18 von 30 Aufgaben richtig)",
    overviewDe:
      "4 Teile mit insgesamt 30 Aufgaben (ca. 40 Min. inkl. 5 Min. Übertragungszeit). Achtung: Teil 1 und Teil 4 hören Sie zweimal (2×), Teil 2 und Teil 3 hören Sie NUR einmal (1×)!",
    parts: [
      {
        partNumber: 1,
        shortLabel: "Teil 1",
        titleDe: "5 kurze Alltagstexte (Durchsagen, Telefon, Radio)",
        titleEn: "5 Short Everyday Audio Texts",
        textGenreDe: "Anrufbeantworter, Bahnhof-/Flughafendurchsagen, Radionachrichten",
        questionFormatDe: "Je Text 2 Fragen: 1× Richtig/Falsch + 1× Multiple Choice (a/b/c)",
        itemCountLabel: "10 Aufgaben (Nr. 1–10)",
        itemCount: 10,
        listenCount: 2,
        listenBadgeDe: "2× hören",
        recommendedMinutes: 12,
        points: 33,
        examTip:
          "Jeder der 5 kurzen Texte wird zweimal abgespielt. Prüfen Sie beim ersten Hören die Hauptaussage (Richtig/Falsch) und beim zweiten Hören das Detail (a, b oder c).",
      },
      {
        partNumber: 2,
        shortLabel: "Teil 2",
        titleDe: "Längerer Vortrag / Führung / Infoveranstaltung",
        titleEn: "Extended Monologue or Guided Tour",
        textGenreDe: "Museumsführung, Begrüßungsvortrag, Informationsveranstaltung",
        questionFormatDe: "5 Multiple-Choice-Aufgaben (3 Optionen: a / b / c)",
        itemCountLabel: "5 Aufgaben (Nr. 11–15)",
        itemCount: 5,
        listenCount: 1,
        listenBadgeDe: "NUR 1× hören!",
        recommendedMinutes: 8,
        points: 17,
        examTip:
          "Sie hören den Vortrag NUR EINMAL! Nutzen Sie die 60 Sekunden Lesezeit vorher, um Schlüsselwörter zu markieren. Die Fragen folgen chronologisch dem Vortrag.",
      },
      {
        partNumber: 3,
        shortLabel: "Teil 3",
        titleDe: "Alltagsgespräch zwischen zwei Personen",
        titleEn: "Informal Everyday Conversation (2 Speakers)",
        textGenreDe: "Gespräch unter Freunden, Nachbarn oder Kollegen (z. B. im Café / an der Haltestelle)",
        questionFormatDe: "7 Aussagen auf Richtig oder Falsch prüfen",
        itemCountLabel: "7 Aufgaben (Nr. 16–22)",
        itemCount: 7,
        listenCount: 1,
        listenBadgeDe: "NUR 1× hören!",
        recommendedMinutes: 8,
        points: 23,
        examTip:
          "Auch dieses Gespräch hören Sie NUR EINMAL! Achten Sie auf Verneinungen („doch nicht“, „lieber“, „stattdessen“) und entscheiden Sie sofort beim Hören.",
      },
      {
        partNumber: 4,
        shortLabel: "Teil 4",
        titleDe: "Radiodiskussion mit 3 Personen (Moderation + 2 Gäste)",
        titleEn: "3-Speaker Radio Discussion (Wer sagt was?)",
        textGenreDe: "Radiodebatte: Moderator/in diskutiert mit zwei Gästen über ein gesellschaftliches Thema",
        questionFormatDe: "Wer sagt was? 8 Aussagen den 3 Personen (a / b / c) zuordnen",
        itemCountLabel: "8 Aufgaben (Nr. 23–30)",
        itemCount: 8,
        listenCount: 2,
        listenBadgeDe: "2× hören",
        recommendedMinutes: 12,
        points: 27,
        examTip:
          "Sie hören die Diskussion zweimal. Prägen Sie sich vorab die Rolle und Haltung der beiden Gäste ein (wer ist dafür, wer ist dagegen?).",
      },
    ],
  },

  lesen: {
    skill: "lesen",
    moduleTitleDe: "Modul Lesen (Goethe-Zertifikat B1)",
    moduleTitleEn: "Official Goethe B1 Reading Exam",
    totalMinutes: 65,
    totalItemsLabel: "5 Teile · 30 Aufgaben insgesamt",
    passingScoreLabel: "Bestehen ab 60% (mind. 18 von 30 Aufgaben richtig)",
    overviewDe:
      "5 Teile mit insgesamt 30 Aufgaben in 65 Minuten: Blog/E-Mail (Richtig/Falsch), 2 Presseartikel (a/b/c), Anzeigen zuordnen (A–J/0), 7 Lesermeinungen (Ja/Nein) und Hausordnung/Regeln (a/b/c).",
    parts: [
      {
        partNumber: 1,
        shortLabel: "Teil 1",
        titleDe: "Blogeintrag / Persönlicher Bericht",
        titleEn: "Personal Blog Post or Email (Richtig / Falsch)",
        textGenreDe: "Längerer persönlicher Blog-, Tagebuch- oder E-Mail-Bericht (~260 Wörter)",
        questionFormatDe: "6 Aussagen auf Richtig oder Falsch prüfen (chronologisch)",
        itemCountLabel: "6 Aufgaben (Nr. 1–6)",
        itemCount: 6,
        recommendedMinutes: 10,
        points: 20,
        examTip:
          "Die 6 Aussagen stehen in derselben Reihenfolge wie die Abschnitte im Text. Achten Sie auf Zeitangaben und Synonyme.",
      },
      {
        partNumber: 2,
        shortLabel: "Teil 2",
        titleDe: "Zwei Presse- / Magazinartikel",
        titleEn: "2 Press / Magazine Articles (Multiple Choice a/b/c)",
        textGenreDe: "2 kürzere journalistische Sachtexte aus Zeitung oder Magazin",
        questionFormatDe: "Je Artikel 3 Multiple-Choice-Fragen (a / b / c) = 6 Aufgaben",
        itemCountLabel: "6 Aufgaben (Nr. 7–12)",
        itemCount: 6,
        recommendedMinutes: 20,
        points: 20,
        examTip:
          "Pro Artikel gibt es genau 3 Fragen. Die erste Frage bezieht sich oft auf das Hauptthema oder den ersten Absatz.",
      },
      {
        partNumber: 3,
        shortLabel: "Teil 3",
        titleDe: "Situatives Lesen: Anzeigen zuordnen",
        titleEn: "Match 7 Everyday Situations to Classified Ads (A–I / 0)",
        textGenreDe: "Kleinanzeigen / Aushänge (A bis I) zu Kursen, Wohnungen, Reisen, Service",
        questionFormatDe: "Für 7 Personen die passende Anzeige finden (oder „0 = Keine passende Anzeige“)",
        itemCountLabel: "7 Aufgaben (Nr. 13–19)",
        itemCount: 7,
        recommendedMinutes: 15,
        points: 23,
        examTip:
          "Jede Anzeige darf nur einmal gewählt werden! Für eine Situation gibt es oft keine passende Anzeige (Option „0“).",
      },
      {
        partNumber: 4,
        shortLabel: "Teil 4",
        titleDe: "Forumsdiskussion / 7 Lesermeinungen",
        titleEn: "7 Reader Comments on a Debate Topic (Ja / Nein)",
        textGenreDe: "7 kurze Leserbriefe (Person 1 bis 7) zu einer Streitfrage",
        questionFormatDe: "Ja (Dafür) oder Nein (Dagegen) für jede der 7 Personen entscheiden",
        itemCountLabel: "7 Aufgaben (Nr. 20–26)",
        itemCount: 7,
        recommendedMinutes: 10,
        points: 23,
        examTip:
          "Manche Personen nennen zwar Vorteile, lehnen das Verbot oder die Regel am Ende aber trotzdem ab. Lesen Sie immer bis zum letzten Satz des Kommentars!",
      },
      {
        partNumber: 5,
        shortLabel: "Teil 5",
        titleDe: "Hausordnung / Offizielle Regeln & Anweisungen",
        titleEn: "Official Rules, Instructions, or Policy Notice (a/b/c)",
        textGenreDe: "Hausordnung, Bibliotheksordnung, AGB oder Verhaltensregeln",
        questionFormatDe: "4 Multiple-Choice-Fragen (3 Optionen: a / b / c)",
        itemCountLabel: "4 Aufgaben (Nr. 27–30)",
        itemCount: 4,
        recommendedMinutes: 10,
        points: 14,
        examTip:
          "Achten Sie auf juristische oder formelle Wörter wie „sofern“, „vorausgesetzt“, „ausgenommen“, „verpflichtet“ und „untersagt“.",
      },
    ],
  },

  schreiben: {
    skill: "schreiben",
    moduleTitleDe: "Modul Schreiben (Goethe-Zertifikat B1)",
    moduleTitleEn: "Official Goethe B1 Writing Exam",
    totalMinutes: 60,
    totalItemsLabel: "3 Aufgaben · 60 Minuten · 100 Punkte",
    passingScoreLabel: "Bestehen ab 60 von 100 Punkten",
    overviewDe:
      "3 Schreibaufgaben in 60 Minuten: Aufgabe 1 (informelle E-Mail, ~80 Wörter, 20 Min., 40 Pkt.), Aufgabe 2 (Forumsbeitrag zur Meinungsäußerung, ~80 Wörter, 25 Min., 40 Pkt.) und Aufgabe 3 (formelle Kurzmitteilung im „Sie“-Ton, ~40 Wörter, 15 Min., 20 Pkt.).",
    parts: [
      {
        partNumber: 1,
        shortLabel: "Aufgabe 1",
        titleDe: "Persönliche / Informelle E-Mail („du“-Form)",
        titleEn: "Task 1: Informal Personal Email (~80 Words)",
        textGenreDe: "Private E-Mail an einen Freund / eine Freundin",
        questionFormatDe: "3 verbindliche Inhaltspunkte (beschreiben, begründen, Vorschlag machen)",
        itemCountLabel: "ca. 80 Wörter · 3 Leitpunkte",
        itemCount: 3,
        recommendedMinutes: 20,
        points: 40,
        examTip:
          "Bearbeiten Sie UNBEDINGT alle 3 Inhaltspunkte und fügen Sie eine passende informelle Anrede („Liebe/r...“) sowie Grußformel („Viele Grüße“) hinzu.",
      },
      {
        partNumber: 2,
        shortLabel: "Aufgabe 2",
        titleDe: "Diskussionsbeitrag im Online-Gästebuch / Forum",
        titleEn: "Task 2: Online Forum Opinion Post (~80 Words)",
        textGenreDe: "Leserkommentar in einem Online-Forum als Reaktion auf einen Diskussionsbeitrag",
        questionFormatDe: "Auf den Impulsbeitrag eingehen + eigene Meinung äußern und begründen",
        itemCountLabel: "ca. 80 Wörter · Meinungsäußerung",
        itemCount: 3,
        recommendedMinutes: 25,
        points: 40,
        examTip:
          "Beziehen Sie sich im ersten Satz kurz auf den Beitrag im Gästebuch und begründen Sie Ihre Meinung mit B1-Konnektoren (weil, obwohl, einerseits... andererseits).",
      },
      {
        partNumber: 3,
        shortLabel: "Aufgabe 3",
        titleDe: "Formelle / Halbformelle Kurzmitteilung („Sie“-Form)",
        titleEn: "Task 3: Formal Short Message (~40 Words)",
        textGenreDe: "Höfliche E-Mail an Kursleiter/in, Chef/in, Vermieter/in oder Behörde",
        questionFormatDe: "Sich höflich entschuldigen / Termin absagen + Grund & Bitte äußern",
        itemCountLabel: "ca. 40 Wörter · „Sie“-Form",
        itemCount: 2,
        recommendedMinutes: 15,
        points: 20,
        examTip:
          "Nutzen Sie durchgehend die Höflichkeitsform „Sie“ / „Ihr“, Konjunktiv II („Ich möchte mich entschuldigen“, „Könnten Sie bitte...“) und „Mit freundlichen Grüßen“.",
      },
    ],
  },

  sprechen: {
    skill: "sprechen",
    moduleTitleDe: "Modul Sprechen (Goethe-Zertifikat B1)",
    moduleTitleEn: "Official Goethe B1 Speaking Exam",
    totalMinutes: 15,
    totalItemsLabel: "3 Teile · ca. 15 Min. Paarprüfung (+ 15 Min. Vorbereitung)",
    passingScoreLabel: "Bestehen ab 60 von 100 Punkten",
    overviewDe:
      "3 Teile: Teil 1 Gemeinsam etwas planen (ca. 3 Min., 4 Leitpunkte), Teil 2 Ein Thema präsentieren (ca. 3–4 Min., 5 Folien) und Teil 3 Rückmeldung & Fragen zum Thema (ca. 2 Min.).",
    parts: [
      {
        partNumber: 1,
        shortLabel: "Teil 1",
        titleDe: "Gemeinsam etwas planen",
        titleEn: "Part 1: Collaborative Planning Dialogue",
        textGenreDe: "Dialog mit Prüfungspartner/in zu 4 vorgegebenen Planungspunkten",
        questionFormatDe: "Vorschläge machen, reagieren, Alternativen abwägen, sich einigen",
        itemCountLabel: "4 Leitpunkte · ca. 3 Min.",
        itemCount: 4,
        recommendedMinutes: 3,
        points: 28,
        examTip:
          "Haken Sie alle 4 Punkte der Aufgabenkarte im Gespräch aktiv ab und verwenden Sie Konjunktiv II für Vorschläge („Wir könnten...“, „Wie wäre es, wenn...“).",
      },
      {
        partNumber: 2,
        shortLabel: "Teil 2",
        titleDe: "Ein Thema präsentieren (5 Folien)",
        titleEn: "Part 2: Structured 5-Slide Mini-Presentation",
        textGenreDe: "Monolog anhand von 5 vorgegebenen Folien",
        questionFormatDe: "1. Thema · 2. Eigene Erfahrungen · 3. Heimatland · 4. Vor-/Nachteile & Meinung · 5. Abschluss",
        itemCountLabel: "5 Folien · ca. 3–4 Min.",
        itemCount: 5,
        recommendedMinutes: 4,
        points: 40,
        examTip:
          "Gliedern Sie Ihren Vortrag klar nach den 5 Folien und nennen Sie sowohl mindestens einen Vorteil als auch einen Nachteil, bevor Sie Ihr Fazit ziehen.",
      },
      {
        partNumber: 3,
        shortLabel: "Teil 3",
        titleDe: "Über ein Thema sprechen (Rückmeldung & Fragen)",
        titleEn: "Part 3: Feedback & Spontaneous Q&A",
        textGenreDe: "Kurze Rückmeldung zur Präsentation + 2–3 Nachfragen beantworten und stellen",
        questionFormatDe: "Feedback geben, Fragen spontan beantworten, Gegenfrage stellen",
        itemCountLabel: "Rückmeldung + 2–3 Fragen · ca. 2 Min.",
        itemCount: 3,
        recommendedMinutes: 2,
        points: 32,
        examTip:
          "Geben Sie nach dem Vortrag des Partners kurz eine freundliche Rückmeldung und stellen Sie eine interessierte Anschlussfrage zum Thema.",
      },
    ],
  },
};

export function inferExercisePartNumber(
  ex: Pick<SkillDrillExercise, "examPartNumber" | "examPartLabel" | "title">
): 1 | 2 | 3 | 4 | 5 | undefined {
  if (ex.examPartNumber) return ex.examPartNumber;
  const hay = `${ex.examPartLabel} ${ex.title}`;
  if (/Teil\s*1|Aufgabe\s*1/i.test(hay)) return 1;
  if (/Teil\s*2|Aufgabe\s*2/i.test(hay)) return 2;
  if (/Teil\s*3|Aufgabe\s*3/i.test(hay)) return 3;
  if (/Teil\s*4/i.test(hay)) return 4;
  if (/Teil\s*5/i.test(hay)) return 5;
  return undefined;
}

export function getExerciseTargetSeconds(
  ex: Pick<
    SkillDrillExercise,
    "skill" | "recommendedMinutes" | "examPartNumber" | "examPartLabel" | "title" | "instructions"
  >
): number {
  if (ex.recommendedMinutes && ex.recommendedMinutes > 0) {
    return Math.round(ex.recommendedMinutes * 60);
  }
  const partNum = inferExercisePartNumber(ex);
  if (partNum) {
    const partSpec = GOETHE_B1_BLUEPRINT[ex.skill]?.parts.find(
      (p) => p.partNumber === partNum
    );
    if (partSpec?.recommendedMinutes) {
      return Math.round(partSpec.recommendedMinutes * 60);
    }
  }
  const instrMatch = ex.instructions?.match(/(\d+)\s*Minuten/i);
  if (instrMatch) {
    const mins = Number(instrMatch[1]);
    if (mins > 0 && mins <= 120) return mins * 60;
  }
  return ex.skill === "schreiben" ? 20 * 60 : 10 * 60;
}
