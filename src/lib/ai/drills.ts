import {
  CefrLevel,
  DatabaseSchema,
  LeitpunktStructureSuggestion,
  LeitpunktVocabSuggestion,
  SkillDrillExercise,
  SkillDrillGrade,
  WritingDifficultyMode,
  WritingPillarScores,
  WritingPrewriteOutline,
} from "../types";
import {
  LesenReaderPack,
  makeModelAnswerKey,
  makeQuestionAssistKey,
  normalizeCacheText,
  setCachedEntriesBatch,
} from "../assist-cache";
import { extractJsonObject, generateWithAi } from "./providers";

function buildDemoDrill(
  skill: "hoeren" | "lesen" | "schreiben",
  db: DatabaseSchema,
  vocabCategoryId?: string,
  grammarStandardId?: string
): SkillDrillExercise {
  const level = db.profile.targetLevel;
  const vocabCat =
    db.mastery.vocabCategories.find((v) => v.id === vocabCategoryId) ??
    db.mastery.vocabCategories[0];

  if (skill === "hoeren") {
    return {
      id: `drill-hoeren-${Date.now()}`,
      skill: "hoeren",
      level,
      topicDe: vocabCat?.titleDe ?? "Alltag & Arbeit",
      topicEn: vocabCat?.titleEn ?? "Work & Daily Life",
      vocabCategoryId: vocabCat?.id,
      grammarStandardId,
      title: `Goethe ${level} Hören: Alltagsgespräch & Durchsage`,
      examPartLabel: `Hören · Teil 2 / 3 (${level})`,
      instructions:
        "Listen carefully to the German audio (play it 1–2 times without reading the text first!), then answer all 3 comprehension questions.",
      passageDe:
        "Guten Tag, Frau Weber, hier spricht Lukas aus der Personalabteilung. Vielen Dank für Ihre Bewerbung als Projektassistentin! Wir fanden Ihren Lebenslauf sehr interessant und möchten Sie gern zu einem Vorstellungsgespräch einladen. Passt es Ihnen am kommenden Donnerstag um 10 Uhr 30 in unserem Büro in der Bahnhofstraße? Da die U-Bahn-Linie 4 gerade renoviert wird, empfehle ich Ihnen, den Bus Nummer 18 bis zur Haltestelle Stadtpark zu nehmen. Bitte bringen Sie Ihre Zeugnisse mit und rufen Sie uns kurz an, falls der Termin nicht passt.",
      questions: [
        {
          id: "q1",
          questionDe: "Warum ruft Lukas Frau Weber an?",
          options: [
            "Er möchte sie zu einem Vorstellungsgespräch einladen.",
            "Er möchte ihr sagen, dass die Stelle schon besetzt ist.",
            "Er braucht noch ihren Lebenslauf per E-Mail.",
          ],
          correctIndex: 0,
          explanation:
            "Lukas sagt: „Wir möchten Sie gern zu einem Vorstellungsgespräch einladen.“",
        },
        {
          id: "q2",
          questionDe: "Welches Verkehrsmittel empfiehlt Lukas?",
          options: [
            "Die U-Bahn-Linie 4 direkt zum Büro.",
            "Den Bus Nummer 18 bis zur Haltestelle Stadtpark.",
            "Mit dem eigenen Auto zu kommen.",
          ],
          correctIndex: 1,
          explanation:
            "Die U-Bahn-Linie 4 wird gerade renoviert, deshalb empfiehlt er den Bus Nummer 18.",
        },
        {
          id: "q3",
          questionDe: "Was soll Frau Weber zum Termin mitbringen?",
          options: [
            "Einen neuen Lebenslauf.",
            "Ihren Reisepass.",
            "Ihre Zeugnisse.",
          ],
          correctIndex: 2,
          explanation: "Am Ende sagt er: „Bitte bringen Sie Ihre Zeugnisse mit.“",
        },
      ],
      keyVocab: [
        { german: "das Vorstellungsgespräch", meaning: "job interview" },
        { german: "die Personalabteilung", meaning: "HR department" },
        { german: "das Zeugnis", meaning: "certificate / reference" },
      ],
    };
  }

  if (skill === "lesen") {
    return {
      id: `drill-lesen-${Date.now()}`,
      skill: "lesen",
      level,
      topicDe: vocabCat?.titleDe ?? "Umwelt & Alltag",
      topicEn: vocabCat?.titleEn ?? "Environment & Daily Life",
      vocabCategoryId: vocabCat?.id,
      grammarStandardId,
      title: `Goethe ${level} Lesen: Magazinartikel`,
      examPartLabel: `Lesen · Teil 2 (${level})`,
      instructions:
        "Read this Goethe-style German text carefully and choose the best answer for each question.",
      passageDe:
        "Immer mehr Städte in Deutschland testen sogenannte „Reparatur-Cafés“. Einmal im Monat treffen sich dort ehrenamtliche Helfer mit Bürgern, deren Toaster, Fahrräder oder Laptops kaputt sind. Statt defekte Geräte sofort wegzuwerfen und neue zu kaufen, reparieren die Besucher sie gemeinsam bei einer Tasse Kaffee. Die Teilnahme ist kostenlos, aber freiwillige Spenden für Werkzeuge sind willkommen. Laut einer aktuellen Umfrage sparen die Teilnehmer nicht nur Geld, sondern lernen auch neue Nachbarn kennen. Besonders junge Familien nutzen das Angebot regelmäßig, weil ihnen Nachhaltigkeit wichtig ist.",
      questions: [
        {
          id: "q1",
          questionDe: "Was machen die Menschen in einem Reparatur-Café?",
          options: [
            "Sie kaufen günstige gebrauchte Elektrogeräte.",
            "Sie reparieren kaputte Gegenstände gemeinsam mit Helfern.",
            "Sie machen eine Ausbildung zum Elektriker.",
          ],
          correctIndex: 1,
          explanation:
            "Im Text steht: „reparieren die Besucher sie gemeinsam bei einer Tasse Kaffee.“",
        },
        {
          id: "q2",
          questionDe: "Wie viel kostet die Teilnahme im Reparatur-Café?",
          options: [
            "Sie ist kostenlos, aber Spenden sind willkommen.",
            "Man bezahlt einen festen Preis pro Gerät.",
            "Nur junge Familien dürfen kostenlos teilnehmen.",
          ],
          correctIndex: 0,
          explanation:
            "„Die Teilnahme ist kostenlos, aber freiwillige Spenden für Werkzeuge sind willkommen.“",
        },
        {
          id: "q3",
          questionDe: "Welchen zusätzlichen Vorteil nennt die Umfrage?",
          options: [
            "Die Geräte werden schneller als im Geschäft repariert.",
            "Man bekommt kostenlose neue Werkzeuge geschenkt.",
            "Man lernt nebenbei neue Nachbarn kennen.",
          ],
          correctIndex: 2,
          explanation:
            "„sparen die Teilnehmer nicht nur Geld, sondern lernen auch neue Nachbarn kennen.“",
        },
      ],
      keyVocab: [
        { german: "ehrenamtlich", meaning: "voluntary / unpaid" },
        { german: "die Nachhaltigkeit", meaning: "sustainability" },
        { german: "die Spende", meaning: "donation" },
      ],
    };
  }

  return {
    id: `drill-schreiben-${Date.now()}`,
    skill: "schreiben",
    level,
    topicDe: vocabCat?.titleDe ?? "Freizeit & Alltag",
    topicEn: vocabCat?.titleEn ?? "Free Time & Daily Life",
    vocabCategoryId: vocabCat?.id,
    grammarStandardId,
    title: `Goethe ${level} Schreiben: Persönliche E-Mail`,
    examPartLabel: `Schreiben · Teil 1 (${level})`,
    instructions:
      "Write a realistic German email covering ALL 3 bullet points below (~80 words). Your AI coach will grade it against official Goethe criteria and highlight exact upgrades.",
    writingPromptDe:
      "Sie waren am letzten Wochenende zum ersten Mal in einer neuen Stadt in Deutschland und möchten Ihrem Freund / Ihrer Freundin davon erzählen.",
    writingBulletsDe: [
      "Beschreiben Sie: Wohin sind Sie gefahren und was hat Ihnen besonders gefallen?",
      "Begründen Sie: Warum möchten Sie bald noch einmal dorthin fahren?",
      "Machen Sie einen Vorschlag für ein gemeinsames Treffen, um Fotos zu zeigen.",
    ],
    minWords: 70,
    keyVocab: [
      { german: "Besonders gut hat mir gefallen, dass...", meaning: "I especially liked that..." },
      { german: "Ich würde mich freuen, wenn...", meaning: "I would be happy if..." },
      { german: "Hast du nächste Woche Zeit?", meaning: "Do you have time next week?" },
    ],
  };
}

export async function generateSkillDrill(
  db: DatabaseSchema,
  skill: "hoeren" | "lesen" | "schreiben",
  vocabCategoryId?: string,
  grammarStandardId?: string,
  requestedPartNumber?: 1 | 2 | 3 | 4 | 5
): Promise<SkillDrillExercise> {
  const partNum: 1 | 2 | 3 | 4 | 5 =
    requestedPartNumber ??
    (skill === "schreiben" ? 1 : skill === "hoeren" ? 2 : 1);

  const fallback = buildDemoDrill(skill, db, vocabCategoryId, grammarStandardId);
  if (db.aiConfig.provider === "demo") {
    return { ...fallback, examPartNumber: partNum };
  }

  const level = db.profile.targetLevel;
  const vocabCat = vocabCategoryId
    ? db.mastery.vocabCategories.find((v) => v.id === vocabCategoryId)
    : [...db.mastery.vocabCategories].sort(
        (a, b) => a.progressPct - b.progressPct
      )[0];
  const gramStd = grammarStandardId
    ? db.mastery.grammarStandards.find((g) => g.id === grammarStandardId)
    : undefined;

  const activeBottlenecks = db.memory.bottlenecks
    .filter((b) => b.severity !== "mastered")
    .slice(0, 3)
    .map((b) => `- ${b.title}`)
    .join("\n");

  const topicPrompt = vocabCat
    ? `${vocabCat.titleDe} (${vocabCat.titleEn}) — incorporate words like: ${vocabCat.sampleWords.join(", ")}`
    : "High-frequency everyday Goethe exam topic";

  const grammarPrompt = gramStd
    ? `Include natural examples/opportunities for: ${gramStd.titleDe} (${gramStd.description})`
    : "Use authentic CEFR grammar for this level.";

  // Official Goethe B1 part-specific instructions
  let partSpecInstructions = "";
  let defaultMaxPlays: 1 | 2 | undefined = undefined;
  let defaultBadge = "";
  let defaultMinutes = 10;

  if (skill === "hoeren") {
    if (partNum === 1) {
      defaultMaxPlays = 2;
      defaultMinutes = 8;
      defaultBadge = "Kurztexte · Richtig/Falsch + a/b/c · 2× hören";
      partSpecInstructions = `OFFICIAL GOETHE B1 HÖREN TEIL 1 FORMAT:
- Create 2 or 3 short everyday spoken texts (announcements, voicemails, radio notices) in "sections" (with label "Text 1", "Text 2", etc.) AND concatenate them in "passageDe".
- For EACH short text, create 2 questions: the 1st question MUST be Richtig/Falsch (options: ["Richtig", "Falsch"], questionType: "richtig_falsch"), and the 2nd question MUST be 3-option Multiple Choice (options: ["...", "...", "..."], questionType: "mcq"). (Total 4 to 6 questions).`;
    } else if (partNum === 2) {
      defaultMaxPlays = 1;
      defaultMinutes = 8;
      defaultBadge = "1 Vortrag/Führung · 5 Aufgaben (a/b/c) · NUR 1× hören!";
      partSpecInstructions = `OFFICIAL GOETHE B1 HÖREN TEIL 2 FORMAT:
- Create ONE extended spoken monologue / guided tour / presentation (160-220 words in "passageDe").
- Create EXACTLY 5 chronological Multiple-Choice questions (3 options each, questionType: "mcq").`;
    } else if (partNum === 3) {
      defaultMaxPlays = 1;
      defaultMinutes = 8;
      defaultBadge = "Alltagsgespräch (2 Personen) · Richtig/Falsch · NUR 1× hören!";
      partSpecInstructions = `OFFICIAL GOETHE B1 HÖREN TEIL 3 FORMAT:
- Create an authentic everyday dialogue between 2 friends or colleagues (6-8 turns in "sections" with speakerRole and edgeVoice alternating between "de-DE-SeraphinaMultilingualNeural" and "de-DE-ConradNeural", and full dialogue in "passageDe").
- Create 5 to 7 chronological Richtig/Falsch statements (options: ["Richtig", "Falsch"], questionType: "richtig_falsch").`;
    } else {
      defaultMaxPlays = 2;
      defaultMinutes = 10;
      defaultBadge = "Radiodiskussion (3 Personen) · Wer sagt was? (a/b/c) · 2× hören";
      partSpecInstructions = `OFFICIAL GOETHE B1 HÖREN TEIL 4 FORMAT:
- Create a 3-speaker radio debate (Moderatorin + Gast 1 + Gast 2) with 6-8 turns in "sections" (assigning edgeVoice "de-DE-SeraphinaMultilingualNeural", "de-DE-ConradNeural", and "de-DE-KatjaNeural") and full transcript in "passageDe".
- Create 6 "Wer sagt was?" questions (questionType: "speaker_match") where options for EVERY question are ["a) Die Moderatorin", "b) [Name Gast 1]", "c) [Name Gast 2]"].`;
    }
  } else if (skill === "lesen") {
    if (partNum === 1) {
      defaultMinutes = 10;
      defaultBadge = "Blog / E-Mail · 6 Aufgaben (Richtig / Falsch)";
      partSpecInstructions = `OFFICIAL GOETHE B1 LESEN TEIL 1 FORMAT:
- Create a personal blog post or long email (180-240 words in "passageDe").
- Create 6 chronological Richtig/Falsch statements (options: ["Richtig", "Falsch"], questionType: "richtig_falsch").`;
    } else if (partNum === 2) {
      defaultMinutes = 15;
      defaultBadge = "Presseartikel · Multiple Choice (a/b/c)";
      partSpecInstructions = `OFFICIAL GOETHE B1 LESEN TEIL 2 FORMAT:
- Create 1 or 2 journalistic press articles (in "passageDe" and optional "sections").
- Create 3 to 6 Multiple-Choice questions (3 options each, questionType: "mcq").`;
    } else if (partNum === 3) {
      defaultMinutes = 12;
      defaultBadge = "Anzeigen zuordnen (A–F / 0)";
      partSpecInstructions = `OFFICIAL GOETHE B1 LESEN TEIL 3 FORMAT:
- Create 5 short classified ads (Anzeige A to Anzeige E) in "sections" and "passageDe".
- Create 4 person situations as questions (questionType: "ad_match") where options list the ads plus "0 — Keine passende Anzeige".`;
    } else if (partNum === 4) {
      defaultMinutes = 10;
      defaultBadge = "Lesermeinungen · Ja (Dafür) / Nein (Dagegen)";
      partSpecInstructions = `OFFICIAL GOETHE B1 LESEN TEIL 4 FORMAT:
- Create 5 short reader comments (Person 1 to Person 5) debating a concrete yes/no rule or ban, in "sections" and "passageDe".
- Create 5 questions (one per person, questionType: "ja_nein") with options ["Ja (Dafür)", "Nein (Dagegen)"].`;
    } else {
      defaultMinutes = 10;
      defaultBadge = "Hausordnung / Offizielle Regeln · 4 Aufgaben (a/b/c)";
      partSpecInstructions = `OFFICIAL GOETHE B1 LESEN TEIL 5 FORMAT:
- Create an official German house rules / terms & regulations document with §1–§4 (150-200 words in "passageDe").
- Create 4 Multiple-Choice questions (3 options each, questionType: "mcq").`;
    }
  } else {
    if (partNum === 1) {
      defaultMinutes = 20;
      defaultBadge = "Aufgabe 1 · Informelle E-Mail („du“) · ~80 Wörter · 40 Pkt.";
      partSpecInstructions = `OFFICIAL GOETHE B1 SCHREIBEN AUFGABE 1 FORMAT:
- Informal personal email to a friend ("du"-Form, ~80 words, 3 mandatory content bullet points: describe, give reason, make suggestion).`;
    } else if (partNum === 2) {
      defaultMinutes = 25;
      defaultBadge = "Aufgabe 2 · Online-Gästebuch / Forum · ~80 Wörter · 40 Pkt.";
      partSpecInstructions = `OFFICIAL GOETHE B1 SCHREIBEN AUFGABE 2 FORMAT:
- Online discussion forum / guestbook post (~80 words). Include "writingContextQuoteDe" with a short forum comment from another reader that the learner responds to!`;
    } else {
      defaultMinutes = 15;
      defaultBadge = "Aufgabe 3 · Formelle Kurzmitteilung („Sie“) · ~40 Wörter · 20 Pkt.";
      partSpecInstructions = `OFFICIAL GOETHE B1 SCHREIBEN AUFGABE 3 FORMAT:
- Formal / semi-formal polite short email ("Sie"-Form, ~40 words) to a teacher, boss, landlord, or office (apology/cancellation + brief request).`;
    }
  }

  const schemaDesc =
    skill === "schreiben"
      ? `{
  "title": "Short title",
  "examPartLabel": "Schreiben · Aufgabe ${partNum} (${level})",
  "instructions": "Brief instructions in ${db.profile.nativeLanguage}",
  "writingContextQuoteDe": "Optional forum stimulus post in German (for Aufgabe 2)",
  "writingPromptDe": "Authentic German Goethe-style writing scenario (2-3 sentences)",
  "writingBulletsDe": ["Bullet 1 in German", "Bullet 2 in German"${partNum === 3 ? "" : ', "Bullet 3 in German"'}],
  "minWords": ${partNum === 3 ? 40 : level === "A2" ? 45 : level === "B2" ? 130 : 80},
  "keyVocab": [{"german": "useful German phrase", "meaning": "meaning in ${db.profile.nativeLanguage}"}]
}`
      : `{
  "title": "Short title",
  "examPartLabel": "${skill === "hoeren" ? "Hören" : "Lesen"} · Teil ${partNum} (${level})",
  "instructions": "Brief instructions in ${db.profile.nativeLanguage}",
  "passageDe": "Full German text or transcript",
  "sections": [
    {
      "id": "s1",
      "label": "Section or Speaker label",
      "title": "Optional title",
      "speakerRole": "Optional speaker name",
      "edgeVoice": "de-DE-SeraphinaMultilingualNeural",
      "textDe": "German text for this section/turn"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "sectionLabel": "Optional section ref",
      "questionType": "mcq",
      "questionDe": "German comprehension question or Richtig/Falsch statement",
      "options": ["Option A", "Option B"],
      "correctIndex": 0,
      "explanation": "Short explanation quoting exact German evidence"
    }
  ],
  "keyVocab": [{"german": "German word/phrase from passage", "meaning": "meaning in ${db.profile.nativeLanguage}"}]
}`;

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are an official German ${db.profile.goalTitle} exam designer creating authentic ${level} ${skill.toUpperCase()} Teil ${partNum} practice tasks. Output strictly valid JSON.`,
        },
        {
          role: "user",
          content: `Create ONE fresh ${level} ${skill.toUpperCase()} Teil ${partNum} exam exercise.
Topic Category: ${topicPrompt}
Grammar Target: ${grammarPrompt}
Learner's Active Bottlenecks:
${activeBottlenecks || "None"}

${partSpecInstructions}

${
  skill !== "schreiben"
    ? `STRICT LOGIC CHECK (CRITICAL — ZERO HALLUCINATION):
- Every correct answer MUST be 100% logically entailed by an explicit sentence in passageDe/sections.
- NEVER confuse "obwohl" (although) with "weil" (because) or ask "Warum..." unless the passage explicitly states a cause!
- Every wrong option MUST be clearly contradicted or unsupported by the passage.`
    : "Follow the exact Goethe B1 Schreiben Aufgabe format."
}
Include 3-4 high-value keyVocab items.

Return ONLY valid JSON matching:
${schemaDesc}`,
        },
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<SkillDrillExercise>>(result.text);
    if (!parsed) return { ...fallback, examPartNumber: partNum };

    if (skill === "schreiben" && (!parsed.writingPromptDe || !parsed.writingBulletsDe?.length)) {
      return { ...fallback, examPartNumber: partNum };
    }
    if (skill !== "schreiben" && (!parsed.passageDe || !parsed.questions?.length)) {
      return { ...fallback, examPartNumber: partNum };
    }

    return {
      id: `drill-${skill}-t${partNum}-${Date.now()}`,
      skill,
      level,
      topicDe: vocabCat?.titleDe ?? fallback.topicDe,
      topicEn: vocabCat?.titleEn ?? fallback.topicEn,
      vocabCategoryId: vocabCat?.id,
      grammarStandardId: gramStd?.id,
      title: parsed.title || fallback.title,
      examPartNumber: partNum,
      examPartLabel:
        parsed.examPartLabel ||
        `${skill === "hoeren" ? "Hören" : skill === "lesen" ? "Lesen" : "Schreiben"} · ${
          skill === "schreiben" ? "Aufgabe" : "Teil"
        } ${partNum} (${level})`,
      officialFormatBadge: defaultBadge,
      maxPlays: defaultMaxPlays,
      recommendedMinutes: defaultMinutes,
      isOfficialFullPart: true,
      instructions: parsed.instructions || fallback.instructions,
      source: "ai_generated",
      sourceCredit: "AI Bonus Exercise",
      passageDe: parsed.passageDe,
      sections: Array.isArray(parsed.sections) ? parsed.sections : undefined,
      questions: parsed.questions?.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        itemNumber: i + 1,
        sectionLabel: q.sectionLabel,
        questionType: q.questionType,
        questionDe: q.questionDe,
        options: q.options,
        correctIndex:
          typeof q.correctIndex === "number"
            ? Math.max(0, Math.min(q.options.length - 1, q.correctIndex))
            : 0,
        explanation: q.explanation || "",
      })),
      writingContextQuoteDe: parsed.writingContextQuoteDe,
      writingPromptDe: parsed.writingPromptDe,
      writingBulletsDe: parsed.writingBulletsDe,
      minWords: parsed.minWords || (partNum === 3 ? 40 : fallback.minWords),
      keyVocab: Array.isArray(parsed.keyVocab) ? parsed.keyVocab.slice(0, 5) : fallback.keyVocab,
    };
  } catch (err) {
    console.error("Skill drill generation fallback:", err);
    return { ...fallback, examPartNumber: partNum };
  }
}

function getNextCefrLevel(level: CefrLevel): CefrLevel {
  if (level === "A1") return "A2";
  if (level === "A2") return "B1";
  if (level === "B1") return "B2";
  if (level === "B2") return "C1";
  return "C1";
}

function inferWritingRegisterBadge(exercise: SkillDrillExercise): string {
  const lbl = (exercise.examPartLabel || "").toLowerCase();
  const prompt = (exercise.writingPromptDe || "").toLowerCase();
  if (
    exercise.examPartNumber === 3 ||
    lbl.includes("aufgabe 3") ||
    lbl.includes("formell") ||
    prompt.includes("sehr geehrte") ||
    prompt.includes("ihrer lehrerin") ||
    prompt.includes("ihrem chef") ||
    prompt.includes("hausverwaltung")
  ) {
    return "Formell (Sie-Form · Höflich)";
  }
  if (
    exercise.examPartNumber === 2 ||
    lbl.includes("aufgabe 2") ||
    lbl.includes("forum") ||
    lbl.includes("gästebuch") ||
    Boolean(exercise.writingContextQuoteDe)
  ) {
    return "Meinungsäußerung im Online-Forum (Sachlich & Persönlich)";
  }
  return "Informell / Persönlich (du-Form an Freund/in)";
}

export async function gradeWritingDrill(
  db: DatabaseSchema,
  exercise: SkillDrillExercise,
  learnerWritingDe: string
): Promise<SkillDrillGrade> {
  const wordCount = learnerWritingDe.trim().split(/\s+/).filter(Boolean).length;
  const minWords = exercise.minWords ?? 70;
  const registerExpected = inferWritingRegisterBadge(exercise);
  const nextLevel = getNextCefrLevel(exercise.level);
  const bullets = exercise.writingBulletsDe ?? [];

  const basePillarScore = Math.min(
    22,
    Math.max(11, Math.round((wordCount / minWords) * 19))
  );
  const defaultPillars: WritingPillarScores = {
    inhalt: {
      score: basePillarScore,
      maxScore: 25,
      feedback:
        "You addressed the core prompt points. Make sure every required Leitpunkt has 1–2 concrete supporting sentences.",
      bulletChecks: bullets.map((b) => ({
        bulletDe: b,
        covered: wordCount >= Math.round(minWords * 0.5),
        note: "Addressed in draft.",
      })),
    },
    kommunikativeGestaltung: {
      score: basePillarScore,
      maxScore: 25,
      registerExpected,
      feedback: `Expected register: ${registerExpected}. Check greeting, paragraph transitions, and closing formula.`,
    },
    korrektheit: {
      score: basePillarScore,
      maxScore: 25,
      feedback:
        "Watch verb-final word order in subordinate clauses (weil, dass, obwohl, wenn) and case endings after prepositions.",
    },
    wortschatz: {
      score: basePillarScore,
      maxScore: 25,
      feedback: `Solid ${exercise.level} vocabulary. Incorporate more varied connectors (deshalb, außerdem, einerseits... andererseits).`,
    },
  };

  const fallbackGrade: SkillDrillGrade = {
    score: basePillarScore * 4,
    passed: basePillarScore * 4 >= 60,
    praise: `Good effort writing ${wordCount} words in German!`,
    summary:
      "You addressed the prompt clearly. Focus on linking your sentences with B1 connectors (weil, obwohl, deshalb) and checking verb-final word order.",
    pillarScores: defaultPillars,
    writingCorrections: [
      {
        original: learnerWritingDe.slice(0, 120),
        corrected:
          "Tipp: Verbinde deine Sätze mit Konnektoren wie „weil“, „deshalb“ und „außerdem“.",
        explanation:
          "Connect real AI (Gemini / Groq / Ollama) in Settings for line-by-line German writing corrections.",
      },
    ],
    improvedVersionDe:
      "Liebe/r Freund/in,\n\nletztes Wochenende habe ich etwas Tolles erlebt und wollte dir sofort davon erzählen. Es hat mir sehr gut gefallen, weil alles super organisiert war. Wollen wir uns am kommenden Samstag treffen, damit wir darüber sprechen können?\n\nViele Grüße",
    nextLevelVersionDe:
      "Liebe/r Freund/in,\n\nich hoffe, es geht dir gut! Am vergangenen Wochenende hatte ich endlich die Gelegenheit, dieses Erlebnis auszuprobieren, wovon ich dir unbedingt berichten möchte. Besonders beeindruckt hat mich die angenehme Atmosphäre. Hättest du vielleicht am Samstag Zeit, damit wir uns gemütlich auf einen Kaffee treffen?\n\nHerzliche Grüße",
    newBottlenecks: [],
    newVocabulary: exercise.keyVocab.slice(0, 3).map((v) => ({
      german: v.german,
      meaning: v.meaning,
      exampleDe: v.german,
    })),
  };

  if (db.aiConfig.provider === "demo") {
    return fallbackGrade;
  }

  const result = await generateWithAi(db.aiConfig, {
    messages: [
      {
        role: "system",
        content: `You are an official, rigorous Goethe-Zertifikat / telc ${exercise.level} Schreiben examiner and German teacher.
Grade the learner's text strictly, consistently, and fairly on the 4 official German writing pillars (25 points each = 100 total; passing = 60/100):
1. Inhalt / Erfüllung (0-25): Did the learner cover ALL mandatory bullet points (Leitpunkte) and meet the target length?
2. Kommunikative Gestaltung (0-25): Register (${registerExpected}), appropriate greeting/closing, logical flow, and connectors.
3. Korrektheit (0-25): Deduct points proportionally for EVERY grammar, verb position (verb-second after Einerseits/Andererseits, verb-at-end in Nebensätze), case, article, spelling (Rechtschreibung), and noun/verb capitalization (Groß-/Kleinschreibung) error. If a draft still has 8-12 grammar/spelling errors across 5 sentences, Korrektheit MUST be between 8 and 14 (NOT 20+!).
4. Wortschatz (0-25): Vocabulary range and precision appropriate for ${exercise.level} (flag Anglicisms like 'Notifikation' -> 'Benachrichtigung', wrong prepositions like 'auf den Internet' -> 'im Internet', or 'wann' vs 'wenn').

EXHAUSTIVE SENTENCE-BY-SENTENCE & WORD-LEVEL FEEDBACK RULE:
- In "writingCorrections", you MUST inspect EVERY SINGLE SENTENCE the learner wrote that has any error or awkward phrasing (up to 10 sentences, in chronological order from Sentence 1 to the end!).
- Inside each sentence entry in "writingCorrections", populate "issues" with EVERY specific word, spelling, capitalization, case, and sentence-structure error in that sentence so the learner sees 100% of what they can improve for ${exercise.level}!
Output strictly valid JSON.`,
      },
      {
        role: "user",
        content: `Grade this learner's German writing submission in full detail.
Support language for explanations: ${db.profile.nativeLanguage}
Target Level: ${exercise.level} (Next Level for upgrade comparison: ${nextLevel})
Expected Register: ${registerExpected}
Prompt: ${exercise.writingPromptDe}
${exercise.writingContextQuoteDe ? `Forum Stimulus Quote: ${exercise.writingContextQuoteDe}\n` : ""}Required Bullet Points (Leitpunkte):
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}
Target minimum words: ${minWords} (Learner wrote: ${wordCount} words)

LEARNER SUBMISSION:
${learnerWritingDe}

Return ONLY valid JSON:
{
  "score": 0-100 (sum of the 4 pillars below),
  "passed": true/false (true if score >= 60),
  "praise": "Specific encouragement in ${db.profile.nativeLanguage}",
  "summary": "2-3 sentence honest Goethe-style evaluation in ${db.profile.nativeLanguage}",
  "pillarScores": {
    "inhalt": {
      "score": 0-25,
      "maxScore": 25,
      "feedback": "1-2 sentence assessment of content & completeness in ${db.profile.nativeLanguage}",
      "bulletChecks": [
        {
          "bulletDe": "Exact required bullet point text",
          "covered": true/false,
          "note": "Brief note on how well they covered this point or what was missing"
        }
      ]
    },
    "kommunikativeGestaltung": {
      "score": 0-25,
      "maxScore": 25,
      "registerExpected": "${registerExpected}",
      "feedback": "Assessment of du/Sie register, greeting/closing, and connectors in ${db.profile.nativeLanguage}"
    },
    "korrektheit": {
      "score": 0-25,
      "maxScore": 25,
      "feedback": "Detailed assessment of grammar, verb position, spelling, capitalization, and cases in ${db.profile.nativeLanguage}"
    },
    "wortschatz": {
      "score": 0-25,
      "maxScore": 25,
      "feedback": "Assessment of ${exercise.level} vocabulary, prepositions, and word choices in ${db.profile.nativeLanguage}"
    }
  },
  "writingCorrections": [
    {
      "original": "Exact sentence from learner's text (analyze EVERY sentence that has any mistake!)",
      "corrected": "Clean, natural ${exercise.level} correction of this complete sentence",
      "explanation": "Clear explanation in ${db.profile.nativeLanguage} of how the sentence structure and grammar were fixed",
      "bottleneckTag": "Primary category (e.g. Satzbau & Verbposition, Rechtschreibung & Großschreibung, Kasus & Präpositionen)",
      "issues": [
        {
          "type": "one of: spelling | capitalization | word_order | case_gender | word_choice",
          "wrong": "exact wrong word or phrase (e.g. 'Konzenteiren', 'regeln', 'Einerseits Schüler können', 'Meine Meinung nach', 'auf den Internet')",
          "right": "corrected word or phrase (e.g. 'konzentrieren', 'Regeln', 'Einerseits können sich Schüler', 'Meiner Meinung nach', 'im Internet')",
          "rule": "1-line rule in ${db.profile.nativeLanguage}"
        }
      ]
    }
  ],
  "b1ImprovementTips": [
    "Actionable B1 tip 1 tailored to this draft (e.g. Verb-second after Einerseits/Andererseits)",
    "Actionable B1 tip 2 (e.g. Noun & verb capitalization rules found in this draft)",
    "Actionable B1 tip 3 (e.g. Subordinate clause verb-at-end & 'wenn' vs 'wann')",
    "Actionable B1 tip 4 (e.g. Stronger B1 connectors or idioms for this topic)"
  ],
  "improvedVersionDe": "Clean corrected version of the learner's OWN text at ${exercise.level} level (fix all mistakes while keeping their ideas and voice)",
  "nextLevelVersionDe": "An upgraded version of the learner's text at ${nextLevel} (+1 CEFR level) showing richer connectors and phrasing",
  "newBottlenecks": [
    {
      "title": "Short recurring weakness name (top 1-3 mistakes)",
      "category": "grammar | vocabulary | exam_strategy",
      "description": "What to fix",
      "exampleMistake": "learner's mistake",
      "betterGerman": "correct German",
      "severity": "high | medium"
    }
  ],
  "newVocabulary": [
    {"german": "useful German phrase/Redemittel for this task", "meaning": "meaning in ${db.profile.nativeLanguage}", "exampleDe": "German example sentence"}
  ]
}`,
      },
    ],
    temperature: 0.25,
    jsonMode: true,
    maxTokens: 4096,
    timeoutMs: 40000,
  });

  const parsed = extractJsonObject<Partial<SkillDrillGrade>>(result.text);
  if (!parsed || typeof parsed.score !== "number") {
    throw new Error(
      "AI examiner returned an incomplete response — please tap Grade again."
    );
  }

  const clamp25 = (n: unknown, def: number) =>
    typeof n === "number" ? Math.max(0, Math.min(25, Math.round(n))) : def;

  const ps = parsed.pillarScores;
  const pillarScores: WritingPillarScores = ps
    ? {
        inhalt: {
          score: clamp25(ps.inhalt?.score, defaultPillars.inhalt.score),
          maxScore: 25,
          feedback: ps.inhalt?.feedback || defaultPillars.inhalt.feedback,
          bulletChecks: Array.isArray(ps.inhalt?.bulletChecks)
            ? ps.inhalt.bulletChecks
            : defaultPillars.inhalt.bulletChecks,
        },
        kommunikativeGestaltung: {
          score: clamp25(
            ps.kommunikativeGestaltung?.score,
            defaultPillars.kommunikativeGestaltung.score
          ),
          maxScore: 25,
          registerExpected:
            ps.kommunikativeGestaltung?.registerExpected || registerExpected,
          feedback:
            ps.kommunikativeGestaltung?.feedback ||
            defaultPillars.kommunikativeGestaltung.feedback,
        },
        korrektheit: {
          score: clamp25(
            ps.korrektheit?.score,
            defaultPillars.korrektheit.score
          ),
          maxScore: 25,
          feedback:
            ps.korrektheit?.feedback || defaultPillars.korrektheit.feedback,
        },
        wortschatz: {
          score: clamp25(
            ps.wortschatz?.score,
            defaultPillars.wortschatz.score
          ),
          maxScore: 25,
          feedback:
            ps.wortschatz?.feedback || defaultPillars.wortschatz.feedback,
        },
      }
    : defaultPillars;

  const computedTotal =
    pillarScores.inhalt.score +
    pillarScores.kommunikativeGestaltung.score +
    pillarScores.korrektheit.score +
    pillarScores.wortschatz.score;
  const score = Math.max(
    0,
    Math.min(100, Math.round(ps ? computedTotal : parsed.score))
  );

  return {
    score,
    passed: score >= 60,
    praise: parsed.praise || fallbackGrade.praise,
    summary: parsed.summary || fallbackGrade.summary,
    pillarScores,
    writingCorrections: Array.isArray(parsed.writingCorrections)
      ? parsed.writingCorrections.slice(0, 12)
      : [],
    b1ImprovementTips: Array.isArray(parsed.b1ImprovementTips)
      ? parsed.b1ImprovementTips.slice(0, 6)
      : undefined,
    improvedVersionDe:
      parsed.improvedVersionDe || fallbackGrade.improvedVersionDe,
    nextLevelVersionDe:
      parsed.nextLevelVersionDe || fallbackGrade.nextLevelVersionDe,
    newBottlenecks: Array.isArray(parsed.newBottlenecks)
      ? parsed.newBottlenecks.slice(0, 3)
      : [],
    newVocabulary: Array.isArray(parsed.newVocabulary)
      ? parsed.newVocabulary.slice(0, 4)
      : fallbackGrade.newVocabulary,
  };
}

export async function generateWritingPrewriteOutline(
  db: DatabaseSchema,
  exercise: SkillDrillExercise,
  rawNotes: string,
  difficultyMode: WritingDifficultyMode
): Promise<WritingPrewriteOutline> {
  const registerBadgeDe = inferWritingRegisterBadge(exercise);
  const bullets = exercise.writingBulletsDe ?? [];
  const topBottleneck = db.memory.bottlenecks.find(
    (b) => b.severity !== "mastered"
  );
  const memoryReminder = topBottleneck
    ? `Aus deinem Fehlergedächtnis (${topBottleneck.title}): ${topBottleneck.description} — Beispiel: „${topBottleneck.betterGerman}“`
    : "Achte beim Schreiben besonders auf das Verb am Ende nach „weil“, „dass“, „obwohl“ und „wenn“!";

  const isFormal = registerBadgeDe.toLowerCase().includes("formell");
  const isForum = registerBadgeDe.toLowerCase().includes("forum");

  const fallback: WritingPrewriteOutline = {
    registerBadgeDe,
    skeleton: [
      {
        sectionLabel: "1. Anrede & Einleitung",
        goalDe: isFormal
          ? "Höfliche Anrede und Grund Ihres Schreibens kurz nennen"
          : isForum
          ? "Bezug auf das Thema und den Diskussionsbeitrag nehmen"
          : "Freundliche Begrüßung und kurzer Anlass der E-Mail",
        starterPhrasesDe:
          difficultyMode === "outline_only"
            ? []
            : isFormal
            ? ["Sehr geehrte Damen und Herren,", "ich schreibe Ihnen, weil..."]
            : isForum
            ? [
                "Ich habe den Beitrag zum Thema ... mit großem Interesse gelesen.",
                "Meiner Meinung nach ist dieses Thema heute sehr wichtig, weil...",
              ]
            : ["Liebe/r ..., wie geht es dir?", "Ich schreibe dir heute, weil..."],
        userIdeaNote: "Begrüßung + Hauptgrund der Nachricht",
      },
      ...bullets.map((b, idx) => ({
        sectionLabel: `${idx + 2}. Leitpunkt ${idx + 1}`,
        goalDe: b,
        starterPhrasesDe:
          difficultyMode === "outline_only"
            ? []
            : idx === 0
            ? ["Zuerst möchte ich erklären, dass...", "Der Grund dafür ist, dass..."]
            : idx === 1
            ? ["Ein wichtiger Punkt ist außerdem, dass...", "Einerseits ..., andererseits ..."]
            : ["Deshalb würde ich vorschlagen, dass wir...", "Könnten Sie mir bitte...?"],
        userIdeaNote: rawNotes.trim()
          ? `Deine Notiz zu Punkt ${idx + 1} auf Deutsch ausformulieren`
          : `Schreibe 1–2 verbundene Sätze zu: „${b}“`,
      })),
      {
        sectionLabel: `${bullets.length + 2}. Schluss & Grußformel`,
        goalDe: isFormal
          ? "Höflicher Schlusssatz und formelle Grußformel"
          : isForum
          ? "Kurzes Fazit für die Leser im Forum"
          : "Persönlicher Schlusssatz und freundlicher Gruß",
        starterPhrasesDe:
          difficultyMode === "outline_only"
            ? []
            : isFormal
            ? [
                "Vielen Dank im Voraus für Ihr Verständnis.",
                "Mit freundlichen Grüßen",
              ]
            : isForum
            ? [
                "Zusammenfassend finde ich, dass...",
                "Wie seht ihr das? Ich bin gespannt auf eure Meinungen!",
              ]
            : ["Melde dich bald, ob du Zeit hast!", "Liebe Grüße"],
        userIdeaNote: "Passender Abschluss",
      },
    ],
    redemittel:
      difficultyMode === "outline_only"
        ? []
        : [
            ...exercise.keyVocab.map((v) => ({
              german: v.german,
              meaning: v.meaning,
              purpose: "Aufgaben-Wortschatz",
            })),
            {
              german: "Ich schreibe ..., weil ... [Verb am Ende]",
              meaning: "I am writing because ...",
              purpose: "Grund nennen",
            },
            {
              german: "Einerseits ..., andererseits ...",
              meaning: "On the one hand ..., on the other hand ...",
              purpose: "Abwägen / Forum",
            },
            {
              german: "Ich würde vorschlagen, dass wir ... [Verb am Ende]",
              meaning: "I would suggest that we ...",
              purpose: "Vorschlag machen",
            },
          ].slice(0, 7),
    bulletCoverageCheck: bullets.map((b) => ({
      bulletDe: b,
      coveredInNotes: rawNotes.trim().length > 10,
      tip: `Vergiss nicht, „${b}“ mit mindestens einem Nebensatz (weil/dass/damit) zu beantworten.`,
    })),
    memoryReminder,
  };

  if (db.aiConfig.provider === "demo") {
    return fallback;
  }

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are an expert German Goethe-Zertifikat ${exercise.level} Writing Coach helping a learner turn their raw brainstorming notes or rough draft paragraphs into clear, natural, well-structured German.
${
  difficultyMode === "outline_only"
    ? "- Because the learner chose Mode 2 (Outline Only), summarize their main ideas, validate bullet coverage, and map their ideas into paragraphs — set starterPhrasesDe, completeSentencesDe, redemittel, and exampleParagraphDe to empty."
    : `- Because the learner chose Mode 1 (Guided):
  1. Carefully read EVERY idea and paragraph the learner wrote in their brainstorm (even if in ${db.profile.nativeLanguage} or broken German) and summarize their key points in "mainIdeasSummary" so they see you truly understood their arguments!
  2. For EACH paragraph in "skeleton", write 2–3 COMPLETE, grammatically perfect, natural ${exercise.level} German sentences in "completeSentencesDe" AND a complete cohesive "exampleParagraphDe" that upgrades THEIR OWN ideas into natural German they can directly use or adapt by swapping words!
  3. NEVER output incomplete fragments with "..." or "[Verb am Ende]" in "completeSentencesDe" or "bulletCoverageCheck[].structures" — ALWAYS give COMPLETE, ready-to-use German sentences that the learner can insert and customize by replacing words if they want!`
}
Output strictly valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze the learner's brainstorming notes/paragraphs and build a comprehensive ${exercise.level} writing plan with complete German sentences & paragraphs:
Task: ${exercise.examPartLabel} — ${exercise.title}
Expected Register: ${registerBadgeDe}
Prompt: ${exercise.writingPromptDe}
${exercise.writingContextQuoteDe ? `Forum Quote: ${exercise.writingContextQuoteDe}\n` : ""}Mandatory Bullet Points (Leitpunkte):
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Learner's Raw Brainstorm Notes / Rough Draft:
"${rawNotes.trim() || "(Learner has not typed notes yet — generate rich, realistic ideas and complete customizable German sentences for each Leitpunkt!)"}"

Support Language: ${db.profile.nativeLanguage}

Return ONLY valid JSON:
{
  "registerBadgeDe": "${registerBadgeDe}",
  "mainIdeasSummary": [
    "Clear bullet point in ${db.profile.nativeLanguage} summarizing Main Idea 1 understood from the learner's notes (or suggested if notes were empty)",
    "Clear bullet point summarizing Main Idea 2...",
    "Clear bullet point summarizing Main Idea 3..."
  ],
  "skeleton": [
    {
      "sectionLabel": "1. Einleitung / Haltung (or Paragraph label)",
      "goalDe": "Short German description of what this paragraph achieves",
      "userIdeaNote": "How the learner's specific idea maps into this paragraph",
      "starterPhrasesDe": ["Complete natural sentence 1.", "Complete natural sentence 2."],
      "completeSentencesDe": [
        "A COMPLETE, natural, customizable ${exercise.level} German sentence expressing this point (NO '...' blanks!).",
        "A second COMPLETE, natural ${exercise.level} German sentence expressing this point (NO '...' blanks!)."
      ],
      "exampleParagraphDe": "A complete, natural, cohesive ${exercise.level} German paragraph (2–3 sentences) turning the learner's own ideas for this section into polished German they can use or adapt."
    }
  ],
  "redemittel": [
    {
      "german": "Useful complete German phrase or expression",
      "meaning": "Meaning in ${db.profile.nativeLanguage}",
      "purpose": "Short tag (e.g. Meinung, Grund, Risiko, Alternative)"
    }
  ],
  "bulletCoverageCheck": [
    {
      "bulletDe": "Exact required bullet point",
      "coveredInNotes": true/false,
      "tip": "1-line tip in ${db.profile.nativeLanguage} on how to strengthen this point at ${exercise.level} level",
      "structures": [
        {
          "patternDe": "A COMPLETE, grammatically perfect ${exercise.level} German sentence for this Leitpunkt (NO '...' or '[Verb am Ende]' blanks — ready to insert and swap words!)",
          "insertDe": "The exact same complete German sentence (ending with a space)",
          "meaning": "Meaning in ${db.profile.nativeLanguage}",
          "grammarHint": "Short tip on which words can be easily swapped + key grammar rule (e.g. 'Tausche z. B. das Thema/den Grund aus · Verb steht am Ende nach weil')"
        }
      ],
      "vocab": [
        {
          "german": "Topic-specific German keyword or collocation for THIS bullet point (include article/preposition if relevant)",
          "meaning": "Meaning in ${db.profile.nativeLanguage}"
        }
      ]
    }
  ]
}`,
        },
      ],
      temperature: 0.45,
      jsonMode: true,
      maxTokens: 4096,
    });

    const parsed = extractJsonObject<Partial<WritingPrewriteOutline>>(
      result.text
    );
    if (!parsed?.skeleton?.length) return fallback;

    return {
      registerBadgeDe: parsed.registerBadgeDe || registerBadgeDe,
      mainIdeasSummary: Array.isArray(parsed.mainIdeasSummary)
        ? parsed.mainIdeasSummary.filter(Boolean).slice(0, 6)
        : undefined,
      skeleton: parsed.skeleton.map((s) => ({
        sectionLabel: s.sectionLabel || "Abschnitt",
        goalDe: s.goalDe || "",
        starterPhrasesDe:
          difficultyMode === "outline_only"
            ? []
            : Array.isArray(s.starterPhrasesDe)
            ? s.starterPhrasesDe.slice(0, 3)
            : [],
        completeSentencesDe:
          difficultyMode === "outline_only"
            ? []
            : Array.isArray(s.completeSentencesDe)
            ? s.completeSentencesDe.slice(0, 3)
            : undefined,
        exampleParagraphDe:
          difficultyMode === "outline_only"
            ? undefined
            : s.exampleParagraphDe?.trim() || undefined,
        userIdeaNote: s.userIdeaNote || "",
      })),
      redemittel:
        difficultyMode === "outline_only"
          ? []
          : Array.isArray(parsed.redemittel)
          ? parsed.redemittel.slice(0, 8)
          : fallback.redemittel,
      bulletCoverageCheck: Array.isArray(parsed.bulletCoverageCheck)
        ? parsed.bulletCoverageCheck.map((bc, idx) => ({
            bulletDe: bc.bulletDe || bullets[idx] || "",
            coveredInNotes: Boolean(bc.coveredInNotes),
            tip: bc.tip || "",
            structures:
              difficultyMode === "outline_only"
                ? []
                : Array.isArray(bc.structures)
                ? bc.structures.slice(0, 3)
                : undefined,
            vocab:
              difficultyMode === "outline_only"
                ? []
                : Array.isArray(bc.vocab)
                ? bc.vocab.slice(0, 5)
                : undefined,
          }))
        : fallback.bulletCoverageCheck,
      memoryReminder,
    };
  } catch (err) {
    console.error("Prewrite outline fallback:", err);
    return fallback;
  }
}

export async function generateLeitpunktCoachSuggestions(
  db: DatabaseSchema,
  exercise: SkillDrillExercise,
  bulletDe: string,
  bulletIndex: number
): Promise<{
  structures: LeitpunktStructureSuggestion[];
  vocab: LeitpunktVocabSuggestion[];
}> {
  const registerBadgeDe = inferWritingRegisterBadge(exercise);
  const lang = db.profile.nativeLanguage || "English";
  const fallback: {
    structures: LeitpunktStructureSuggestion[];
    vocab: LeitpunktVocabSuggestion[];
  } = {
    structures: [
      {
        patternDe:
          "Meiner Meinung nach ist dieses Thema besonders wichtig, weil es unseren Alltag stark beeinflusst.",
        insertDe:
          "Meiner Meinung nach ist dieses Thema besonders wichtig, weil es unseren Alltag stark beeinflusst. ",
        meaning:
          "In my opinion this topic is especially important because it strongly influences our everyday life.",
        grammarHint:
          "Kompletter Satz zum Anpassen: Du kannst „besonders wichtig“ oder „unseren Alltag stark beeinflusst“ einfach ersetzen.",
      },
      {
        patternDe:
          "Ein wichtiger Grund dafür ist, dass viele Menschen heute mehr Flexibilität im Alltag brauchen.",
        insertDe:
          "Ein wichtiger Grund dafür ist, dass viele Menschen heute mehr Flexibilität im Alltag brauchen. ",
        meaning:
          "An important reason for this is that many people today need more flexibility in everyday life.",
        grammarHint:
          "Kompletter „dass“-Satz (Verb „brauchen“ am Ende) — tausche einfach den Grund nach „dass“ aus.",
      },
      {
        patternDe:
          "Deshalb halte ich es für sinnvoll, eine flexible Lösung für alle Beteiligten zu finden.",
        insertDe:
          "Deshalb halte ich es für sinnvoll, eine flexible Lösung für alle Beteiligten zu finden. ",
        meaning:
          "Therefore I consider it sensible to find a flexible solution for everyone involved.",
        grammarHint:
          "Kompletter Infinitivsatz mit „zu finden“ am Ende — tausche einfach „eine flexible Lösung“ aus.",
      },
    ],
    vocab: [
      ...exercise.keyVocab.slice(0, 3).map((v) => ({
        german: v.german,
        meaning: v.meaning,
      })),
      {
        german: "eine sinnvolle Lösung finden",
        meaning: "to find a sensible solution",
      },
      {
        german: "Vor- und Nachteile abwägen",
        meaning: "to weigh pros and cons",
      },
    ],
  };

  if (db.aiConfig.provider === "demo") {
    return fallback;
  }

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are an expert German Goethe-Zertifikat ${exercise.level} Writing & Vocabulary Coach.
CRITICAL RULE FOR THIS MODE:
- Generate 3 COMPLETE, natural, grammatically perfect ${exercise.level} German sentences (NO "..." blanks, NO "[Verb am Ende]" placeholders!) that the learner can insert directly into their essay and customize by swapping words if they want!
- Also generate 5 high-value topic keywords/collocations (with articles/prepositions/case cues and ${lang} meanings) specifically for THIS single Leitpunkt.
Output strictly valid JSON.`,
        },
        {
          role: "user",
          content: `Task: ${exercise.examPartLabel} — ${exercise.title} (${registerBadgeDe})
Overall Prompt: ${exercise.writingPromptDe}
${exercise.writingContextQuoteDe ? `Stimulus Quote: ${exercise.writingContextQuoteDe}\n` : ""}TARGET LEITPUNKT #${bulletIndex + 1}:
"${bulletDe}"

Return ONLY valid JSON:
{
  "structures": [
    {
      "patternDe": "A COMPLETE, natural, ready-to-use ${exercise.level} German sentence for this Leitpunkt (NO '...' or bracket placeholders!)",
      "insertDe": "The exact same complete German sentence ending with a space",
      "meaning": "Meaning in ${lang}",
      "grammarHint": "Short tip on which words can be swapped + key grammar pattern"
    }
  ],
  "vocab": [
    {
      "german": "Specific German noun (with article), verb collocation, or adjective phrase for this Leitpunkt",
      "meaning": "Meaning in ${lang}"
    }
  ]
}`,
        },
      ],
      temperature: 0.5,
      jsonMode: true,
    });

    const parsed = extractJsonObject<typeof fallback>(result.text);
    if (!parsed?.structures?.length && !parsed?.vocab?.length) {
      return fallback;
    }

    return {
      structures:
        Array.isArray(parsed.structures) && parsed.structures.length
          ? parsed.structures.slice(0, 4)
          : fallback.structures,
      vocab:
        Array.isArray(parsed.vocab) && parsed.vocab.length
          ? parsed.vocab.slice(0, 6)
          : fallback.vocab,
    };
  } catch {
    return fallback;
  }
}

export async function generateWritingSentenceHint(
  db: DatabaseSchema,
  exercise: SkillDrillExercise,
  currentDraft: string,
  stuckRequest: string
): Promise<{
  hintTitle: string;
  startersDe: string[];
  grammarTip: string;
  vocabSuggestions: Array<{ german: string; meaning: string }>;
}> {
  const registerBadgeDe = inferWritingRegisterBadge(exercise);
  const fallback = {
    hintTitle: "Komplette Beispielsätze (zum Einfügen & Anpassen)",
    startersDe: [
      "Ich möchte Ihnen kurz mitteilen, dass ich zu diesem Thema eine klare Meinung habe.",
      "Der wichtigste Grund dafür ist, dass diese Veränderung viele praktische Folgen im Alltag hat.",
      "Deshalb schlage ich vor, dass wir eine flexible und realistische Lösung finden.",
    ],
    grammarTip:
      "Du kannst jeden Satz direkt einfügen und einzelne Wörter durch deine eigenen Ideen ersetzen. Achte bei Nebensätzen mit „weil“, „dass“ oder „obwohl“ darauf, dass das konjugierte Verb am Ende steht.",
    vocabSuggestions: exercise.keyVocab.slice(0, 4),
  };

  if (db.aiConfig.provider === "demo") {
    return fallback;
  }

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are a German ${exercise.level} Writing Coach helping a learner write their next sentence.
RULES:
- Give 2–3 COMPLETE, grammatically perfect, natural German example sentences tailored directly to the learner's question and topic so they can click to insert a full sentence and simply swap/replace words if they want.
- NEVER use incomplete fragments, ellipses ("..."), or bracket placeholders like "[Verb am Ende]". Every sentence in startersDe MUST be a finished German sentence ending in ".", "!", or "?".
- Also provide 3–4 relevant German vocabulary words and 1 concise grammar tip in ${db.profile.nativeLanguage}.
Output strictly valid JSON.`,
        },
        {
          role: "user",
          content: `Task: ${exercise.examPartLabel} (${registerBadgeDe})
Prompt: ${exercise.writingPromptDe}
Bullets: ${(exercise.writingBulletsDe ?? []).join(" | ")}
Learner's current draft so far:
"${currentDraft.slice(-400) || "(just starting)"}"

What the learner needs help with:
"${stuckRequest || "How do I write my next sentence?"}"

Return ONLY valid JSON:
{
  "hintTitle": "Short helpful title",
  "startersDe": ["Complete natural German sentence 1.", "Complete natural German sentence 2.", "Complete natural German sentence 3."],
  "grammarTip": "1-2 sentence grammar/structure tip in ${db.profile.nativeLanguage}",
  "vocabSuggestions": [{"german": "German word/chunk", "meaning": "meaning in ${db.profile.nativeLanguage}"}]
}`,
        },
      ],
      temperature: 0.45,
      jsonMode: true,
    });

    const parsed = extractJsonObject<typeof fallback>(result.text);
    if (!parsed?.startersDe?.length) return fallback;
    return {
      hintTitle: parsed.hintTitle || fallback.hintTitle,
      startersDe: parsed.startersDe.slice(0, 3),
      grammarTip: parsed.grammarTip || fallback.grammarTip,
      vocabSuggestions: Array.isArray(parsed.vocabSuggestions)
        ? parsed.vocabSuggestions.slice(0, 5)
        : fallback.vocabSuggestions,
    };
  } catch {
    return fallback;
  }
}

export type DrillAssistMode =
  | "explain_question"
  | "analyze_answer"
  | "model_answer"
  | "translate_passage"
  | "explain_selection"
  | "ask_tutor";

export interface DrillAssistResult {
  title: string;
  body: string;
  germanExample?: string;
  germanExampleTranslation?: string;
  sentenceBreakdowns?: Array<{
    german: string;
    translation: string;
  }>;
  difficultWords?: Array<{
    german: string;
    translation: string;
    note?: string;
  }>;
  grammarNotes?: Array<{
    pattern: string;
    explanation: string;
  }>;
  bulletHighlights?: string[];
}

export async function assistSkillDrill(
  db: DatabaseSchema,
  params: {
    mode: DrillAssistMode;
    exercise: SkillDrillExercise;
    questionId?: string;
    userQuestion?: string;
    selectedText?: string;
    surroundingSentence?: string;
    selectionType?: "word" | "phrase" | "sentence";
  }
): Promise<DrillAssistResult> {
  const {
    mode,
    exercise,
    questionId,
    userQuestion,
    selectedText,
    surroundingSentence,
    selectionType,
  } = params;
  const lang = db.profile.nativeLanguage || "English";
  const studyLevel = db.profile.targetLevel || exercise.level || "B1";
  const studyPlanGrammarList = db.mastery.grammarStandards
    .map((g) => g.titleDe)
    .slice(0, 12)
    .join(" | ");
  const targetQ = questionId
    ? exercise.questions?.find((q) => q.id === questionId)
    : undefined;

  const fullGermanText =
    exercise.sections && exercise.sections.length > 0
      ? exercise.sections
          .map(
            (s) =>
              `${s.label}${s.title ? ` — ${s.title}` : ""}\n${s.textDe}`
          )
          .join("\n\n")
      : exercise.passageDe || exercise.writingPromptDe || "";

  // Deterministic zero-AI fallback so it ALWAYS returns accurate, helpful output even in Demo Mode!
  const buildFallback = (): DrillAssistResult => {
    if (mode === "explain_question" && targetQ) {
      return {
        title: "Question Breakdown (Hint — No Spoiler)",
        body: `Question: "${targetQ.questionDe}". Look for keywords from this question inside the German text/audio, then compare all 3 options carefully for subtle traps (like "nicht", "nur", or different times/places).`,
        bulletHighlights: targetQ.options.map((o, i) => `Option ${i + 1}: ${o}`),
      };
    }

    if (mode === "analyze_answer" && targetQ) {
      const rightOpt = targetQ.options[targetQ.correctIndex];
      return {
        title: "Verified Answer Analysis",
        body: `Correct answer: "${rightOpt}".\n\nWhy: ${targetQ.explanation}`,
        germanExample: rightOpt,
        difficultWords: exercise.keyVocab.slice(0, 5).map((v) => ({
          german: v.german,
          translation: v.meaning,
        })),
        bulletHighlights: targetQ.options.map((opt, idx) =>
          idx === targetQ.correctIndex
            ? `✓ CORRECT: ${opt}`
            : `✗ WRONG: ${opt} — not supported or contradicted by the passage.`
        ),
      };
    }

    if (mode === "model_answer") {
      if (exercise.skill === "schreiben") {
        return {
          title: `Model ${exercise.level} Example Answer`,
          body: `Here is a structured ${exercise.level} sample covering every required bullet point. Notice the greeting, connectors (weil / deshalb / außerdem), and polite closing.`,
          germanExample: `Hallo!\n\nich schreibe dir heute wegen „${exercise.title}“. ${
            exercise.keyVocab[0]?.german ?? "Besonders wichtig finde ich, dass"
          } wir alle Punkte klar erklären. Außerdem möchte ich meine eigene Meinung und ein konkretes Beispiel nennen, weil das für die ${
            exercise.level
          }-Prüfung sehr hilfreich ist.\n\nViele Grüße!`,
          bulletHighlights: exercise.writingBulletsDe,
        };
      }

      const keyList = (exercise.questions ?? []).map((q, idx) => {
        const right = q.options[q.correctIndex];
        return `Q${idx + 1}: ${right} — ${q.explanation}`;
      });
      return {
        title: "Full Verified Answer Key & Evidence",
        body: "Here is the verified answer and text evidence for every question in this exercise:",
        bulletHighlights: keyList,
      };
    }

    if (mode === "translate_passage") {
      return {
        title: `Full ${studyLevel} Translation, Vocabulary & Grammar Breakdown`,
        body:
          "Connect Gemini, Groq, or Ollama in Settings for a complete paragraph-by-paragraph translation and grammar breakdown. Here are the key German expressions from this exercise:",
        difficultWords: exercise.keyVocab.map((v) => ({
          german: v.german,
          translation: v.meaning,
        })),
        bulletHighlights: exercise.keyVocab.map(
          (v) => `${v.german} = ${v.meaning}`
        ),
      };
    }

    if (mode === "explain_selection") {
      const sel = (selectedText || "").trim();
      const matchedVocab = exercise.keyVocab.find((v) =>
        v.german.toLowerCase().includes(sel.toLowerCase()) ||
        sel.toLowerCase().includes(v.german.toLowerCase())
      );
      return {
        title:
          selectionType === "word"
            ? `Word Breakdown: „${sel}“`
            : `Selection Analysis (${studyLevel})`,
        body: matchedVocab
          ? `„${matchedVocab.german}“ means: ${matchedVocab.meaning}. Connect an AI provider in Settings for full contextual sentence translation and ${studyLevel} grammar rules.`
          : `Selected German text: „${sel}“. Connect an AI provider in Settings for instant contextual translation and ${studyLevel} grammar explanations.`,
        germanExample: sel || undefined,
      };
    }

    return {
      title: "Tutor Guidance",
      body: `Tip for "${exercise.title}": focus on the key phrases below and match exact facts in the German text.`,
      bulletHighlights: exercise.keyVocab.map(
        (v) => `${v.german} — ${v.meaning}`
      ),
    };
  };

  if (db.aiConfig.provider === "demo") {
    return buildFallback();
  }

  let taskPrompt = "";
  if (mode === "explain_question" && targetQ) {
    taskPrompt = `The learner does NOT understand this German exam question and wants help WITHOUT revealing the final answer yet!
Question: ${targetQ.questionDe}
Options:
${targetQ.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Explain clearly in ${lang}:
1. What the question is asking (plain translation).
2. What each option means in ${lang}.
3. A practical listening/reading clue for what to watch out for (DO NOT reveal which option is correct!).`;
  } else if (mode === "analyze_answer" && targetQ) {
    taskPrompt = `Give a thorough, crystal-clear answer analysis for this question in ${lang}, including full-sentence translations, difficult vocabulary translations, and grammar explanations.
Passage:
${exercise.passageDe ?? ""}

Question: ${targetQ.questionDe}
Options:
${targetQ.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}
VERIFIED CORRECT OPTION: #${targetQ.correctIndex + 1} (${
      targetQ.options[targetQ.correctIndex]
    })
Verified Note: ${targetQ.explanation}

Include ALL of the following in your JSON output:
1. "body": Explain clearly why option #${targetQ.correctIndex + 1} is right and briefly why each other option is a trap / wrong.
2. "germanExample": Quote the exact key German evidence sentence from the passage.
3. "germanExampleTranslation": Natural, accurate translation of "germanExample" into ${lang}.
4. "sentenceBreakdowns": Translate ALL key German sentences from the relevant section/speaker statement (2–4 complete German sentences, including the question if helpful) with exact German sentence + natural ${lang} translation.
5. "difficultWords": List 3–6 potentially difficult German words, compound nouns, or idioms from the evidence sentences or question (with article/base form where helpful, ${lang} translation, and optional short literal/usage note).
6. "grammarNotes": Explain 1–3 notable grammar structures or idioms used in the evidence sentence(s) (e.g. fixed expressions like "an + Dativ + vorbeiführen", case endings, Nebensatz verb-end order, Konjunktiv II, Passiv, or connectors) clearly in ${lang}.`;
  } else if (mode === "model_answer") {
    if (exercise.skill === "schreiben") {
      taskPrompt = `Write a natural, high-scoring Goethe ${exercise.level} MODEL ANSWER in German for this writing task:
Prompt: ${exercise.writingPromptDe}
Required Bullets:
${(exercise.writingBulletsDe ?? []).map((b, i) => `${i + 1}. ${b}`).join("\n")}
Target words: ~${exercise.minWords ?? 80} words.

Put the complete German model text in "germanExample", explain in ${lang} in "body" why it scores high (structure, connectors, tone), and list 3–4 structure/Redemittel highlights in "bulletHighlights".`;
    } else {
      taskPrompt = `Provide a complete Answer Key & Evidence Walkthrough in ${lang} for EVERY question in this ${exercise.skill.toUpperCase()} exercise:
Passage:
${exercise.passageDe ?? ""}

Questions & Verified Correct Answers:
${(exercise.questions ?? [])
  .map(
    (q, i) =>
      `Q${i + 1}: ${q.questionDe} | Verified Correct: "${q.options[q.correctIndex]}" | Note: ${q.explanation}`
  )
  .join("\n")}

Put a concise summary in "body" and one clear evidence-backed line per question in "bulletHighlights".`;
    }
  } else if (mode === "translate_passage") {
    taskPrompt = `Translate the ENTIRE German reading/exercise text below faithfully into natural ${lang}, AND list the important ${studyLevel}-level vocabulary and grammar rules that appear in this text.

LEARNER'S CURRENT STUDY PLAN LEVEL: ${studyLevel}
OFFICIAL ${studyLevel} GRAMMAR RULES IN STUDY PLAN: ${studyPlanGrammarList || "Passiv, Konjunktiv II, Relativsätze, Nebensätze (weil/da/obwohl/wenn/damit), Infinitiv mit zu, Genitiv, Adjektivdeklination, Perfekt/Präteritum"}

FULL GERMAN TEXT TO TRANSLATE:
${fullGermanText}
${
  exercise.writingBulletsDe
    ? `\nBullet points:\n${exercise.writingBulletsDe.join("\n")}`
    : ""
}

STRICT OUTPUT REQUIREMENTS:
1. "title": "Full Translation & ${studyLevel} Study Guide — ${exercise.title}"
2. "body": MUST contain the COMPLETE, FULL paragraph-by-paragraph translation of the ENTIRE German text above into natural ${lang}. Preserve EVERY heading and paragraph (e.g. § 1, § 2, § 3, § 4 or Text 1 / Text 2 / Person 1–7) using blank lines between paragraphs. Do NOT summarize, do NOT skip any sentence, and do NOT write a generic intro like "Here is the translation...". Put the complete translated text itself directly in "body"!
3. "germanExample": "" (leave EMPTY string for translate_passage).
4. "difficultWords": List 6–10 important ${studyLevel}-level vocabulary words, compound nouns, or formal expressions that ACTUALLY APPEAR in this text (include article/plural for nouns or infinitive for verbs, ${lang} translation, and a short usage note).
5. "grammarNotes": List 3–6 common ${studyLevel}-level grammar rules that ACTUALLY APPEAR in this text (especially matching the learner's study plan!). In each "pattern", state the rule name + quote the EXACT German phrase from the passage (e.g. "Passiv mit Modalverb (B1): „können ... reserviert werden“" or "Konditionalsatz ohne „wenn“ (B1/B2): „Werden neue Kratzer festgestellt, müssen...“"). In "explanation", explain clearly in ${lang} how the rule works and what it means here.
6. "bulletHighlights": [] (leave empty since vocabulary and grammar are in their dedicated arrays).`;
  } else if (mode === "explain_selection") {
    const sel = (selectedText || "").trim();
    const kind = selectionType || (sel.split(/\s+/).length <= 2 ? "word" : "sentence");
    taskPrompt = `The learner is reading a German ${exercise.level} Lesen text (current study plan level: ${studyLevel}) and clicked/selected a specific ${kind} to understand it deeply.

SELECTED ${kind.toUpperCase()}:
"${sel}"

SURROUNDING SENTENCE IN THE TEXT:
"${surroundingSentence || sel}"

FULL PASSAGE CONTEXT (for accurate meaning in context):
${fullGermanText.slice(0, 650)}

OFFICIAL ${studyLevel} GRAMMAR RULES IN LEARNER'S STUDY PLAN:
${studyPlanGrammarList || "Passiv, Passiv mit Modalverb, Konjunktiv II, Relativsätze, Nebensätze (weil/da/obwohl/wenn/damit), Infinitiv mit zu, sein + zu + Infinitiv, Genitiv, Adjektivdeklination, Nominalisierung"}

STRICT OUTPUT REQUIREMENTS (in ${lang}):
${
  kind === "word"
    ? `1. "title": "Word: „${sel}“ (${studyLevel} Breakdown)"
2. "body": Give the exact meaning of "${sel}" IN THIS CONTEXT in ${lang}, plus its base/dictionary form (article + singular/plural for nouns, infinitive & separable prefix for verbs), part of speech, and register/nuance in 2–3 clear lines.
3. "germanExample": "${sel}"
4. "germanExampleTranslation": Full natural translation of the surrounding sentence ("${surroundingSentence || sel}") in ${lang} so the learner sees how this word fits in the whole sentence.
5. "difficultWords": Give 1–3 helpful entries: the clicked word itself (base form + article + translation) plus 1–2 closely related words/synonyms/word-family items useful at ${studyLevel}.
6. "grammarNotes": If this word's form or role in the surrounding sentence uses a common ${studyLevel} grammar rule (e.g., Genitiv ending, Dativ after a preposition, Passiv participle, Konjunktiv II, connector sending verb to end, adjective ending, separable verb, "sein + zu + Infinitiv"), list 1–2 clear grammar notes explaining it! Otherwise explain the exact grammatical role/case of this word in the sentence.`
    : `1. "title": "${kind === "phrase" ? "Phrase" : "Sentence"} Translation & ${studyLevel} Grammar"
2. "body": Provide a clear, natural, accurate translation of "${sel}" into ${lang} (plus a brief plain-English paraphrase if it's formal/legal German).
3. "germanExample": "${sel}"
4. "germanExampleTranslation": Natural, complete translation of "${sel}" in ${lang}.
5. "difficultWords": List 2–6 potentially difficult words, compound nouns, or expressions inside "${sel}" (with article/base form, ${lang} translation, and brief note).
6. "grammarNotes": Identify and clearly explain ALL common ${studyLevel}-level grammar rules applied in "${sel}" (1–4 rules, prioritizing rules from the learner's ${studyLevel} study plan above — e.g. Passiv mit Modalverb, Konditionalsatz ohne „wenn“, Nebensatz mit „da“/„weil“/„obwohl“, Relativsatz, sein + zu + Infinitiv, Genitiv, Partizip als Adjektiv, Nominalisierung). Quote the exact German words from "${sel}" in "pattern" and explain the rule simply in ${lang} in "explanation"!`
}
7. "bulletHighlights": [] (keep empty or 1 short exam tip if super relevant).`;
  } else {
    taskPrompt = `The learner is currently working on this German ${exercise.level} ${exercise.skill.toUpperCase()} exercise and asks:
"${userQuestion || "Please help me understand this exercise and give an example."}"

Exercise Context:
Title: ${exercise.title}
Text/Prompt: ${exercise.passageDe || exercise.writingPromptDe || ""}
${
  exercise.writingBulletsDe
    ? `Bullets: ${exercise.writingBulletsDe.join(" | ")}`
    : ""
}
${
  exercise.questions
    ? `Questions: ${exercise.questions
        .map((q, i) => `Q${i + 1}: ${q.questionDe}`)
        .join(" | ")}`
    : ""
}

Answer their question directly, clearly, and warmly in ${lang}, giving a concrete German example in "germanExample" if helpful.`;
  }

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are an encouraging, precise German Goethe exam tutor helping a ${db.profile.currentLevel}->${db.profile.targetLevel} learner. Output ONLY valid JSON:
{
  "title": "Short heading",
  "body": "Clear, helpful explanation",
  "germanExample": "Optional exact German quote or complete model German text (omit or empty string if not needed)",
  "germanExampleTranslation": "Optional natural translation of germanExample in ${lang}",
  "sentenceBreakdowns": [
    { "german": "Complete German sentence from the relevant passage/statement", "translation": "Natural full-sentence translation in ${lang}" }
  ],
  "difficultWords": [
    { "german": "difficult German word or idiom", "translation": "translation in ${lang}", "note": "optional brief usage/article/literal hint" }
  ],
  "grammarNotes": [
    { "pattern": "German grammar pattern or idiom from the sentence", "explanation": "Clear concise explanation in ${lang}" }
  ],
  "bulletHighlights": ["Helpful takeaway 1", "Helpful takeaway 2", "Helpful takeaway 3"]
}`,
        },
        { role: "user", content: taskPrompt },
      ],
      temperature: 0.35,
      jsonMode: true,
      timeoutMs: mode === "explain_selection" ? 12000 : undefined,
      workload:
        mode === "ask_tutor" || mode === "explain_selection"
          ? "dynamic"
          : "static",
    });

    const parsed = extractJsonObject<Partial<DrillAssistResult>>(result.text);
    if (!parsed?.body) return buildFallback();

    return {
      title: parsed.title || buildFallback().title,
      body: parsed.body,
      germanExample: parsed.germanExample?.trim() || undefined,
      germanExampleTranslation:
        parsed.germanExampleTranslation?.trim() || undefined,
      sentenceBreakdowns: Array.isArray(parsed.sentenceBreakdowns)
        ? parsed.sentenceBreakdowns
            .filter((s) => s && s.german && s.translation)
            .slice(0, 6)
        : undefined,
      difficultWords: Array.isArray(parsed.difficultWords)
        ? parsed.difficultWords
            .filter((w) => w && w.german && w.translation)
            .slice(0, 10)
        : undefined,
      grammarNotes: Array.isArray(parsed.grammarNotes)
        ? parsed.grammarNotes
            .filter((g) => g && g.pattern && g.explanation)
            .slice(0, 6)
        : undefined,
      bulletHighlights: Array.isArray(parsed.bulletHighlights)
        ? parsed.bulletHighlights.slice(0, 6)
        : undefined,
    };
  } catch (err) {
    console.error("Drill assist fallback:", err);
    return buildFallback();
  }
}

export async function generateSpeakingExampleDialogue(
  db: DatabaseSchema,
  module: {
    title: string;
    titleDe: string;
    category: string;
    targetLevel: string;
    scenarioPrompt: string;
    learnerGoal: string;
  }
): Promise<{
  summary: string;
  exchanges: Array<{ speaker: "Partner" | "You (Example)"; german: string; translation: string }>;
}> {
  const fallback = {
    summary: `Sample ${module.targetLevel} dialogue showing how to open, make a polite suggestion, and react naturally.`,
    exchanges: [
      {
        speaker: "Partner" as const,
        german: `Hallo! Sollen wir heute kurz über „${module.titleDe}“ sprechen? Was ist deine erste Idee?`,
        translation: `Hi! Shall we talk briefly about "${module.titleDe}"? What is your first idea?`,
      },
      {
        speaker: "You (Example)" as const,
        german:
          "Ja, sehr gern! Ich schlage vor, dass wir zuerst die wichtigsten Punkte klären, weil wir dann schneller eine gute Lösung finden.",
        translation:
          "Yes, gladly! I suggest we first clarify the most important points, because then we'll find a good solution faster.",
      },
      {
        speaker: "Partner" as const,
        german: "Das klingt super! Hast du dazu noch einen konkreten Vorschlag?",
        translation: "That sounds great! Do you have a concrete suggestion for that?",
      },
      {
        speaker: "You (Example)" as const,
        german:
          "Wir könnten das am Samstag machen, obwohl ich morgens kurz arbeiten muss. Passt dir der Nachmittag?",
        translation:
          "We could do that on Saturday, although I have to work briefly in the morning. Does the afternoon suit you?",
      },
    ],
  };

  if (db.aiConfig.provider === "demo") return fallback;

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You create short, natural, model German exam sample dialogues calibrated to ${module.targetLevel}. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Create a short 4-line model sample dialogue (Partner -> You -> Partner -> You) for this German speaking task so the learner understands what a strong ${module.targetLevel} conversation sounds like.
Title: ${module.title} (${module.titleDe})
Scenario: ${module.scenarioPrompt}
Goal: ${module.learnerGoal}
Support Language: ${db.profile.nativeLanguage}

Return ONLY valid JSON:
{
  "summary": "1-sentence takeaway in ${db.profile.nativeLanguage}",
  "exchanges": [
    {"speaker": "Partner", "german": "...", "translation": "..."},
    {"speaker": "You (Example)", "german": "...", "translation": "..."},
    {"speaker": "Partner", "german": "...", "translation": "..."},
    {"speaker": "You (Example)", "german": "...", "translation": "..."}
  ]
}`,
        },
      ],
      temperature: 0.5,
      jsonMode: true,
    });

    const parsed = extractJsonObject<typeof fallback>(result.text);
    if (!parsed?.exchanges?.length) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

interface RawPackChunkResponse {
  translatedText?: string;
  textVocab?: Array<{ german: string; translation: string; note?: string }>;
  textGrammar?: Array<{ pattern: string; explanation: string }>;
  sentences?: Array<{
    german: string;
    translation: string;
    difficultWords?: Array<{ german: string; translation: string; note?: string }>;
    grammarNotes?: Array<{ pattern: string; explanation: string }>;
  }>;
  words?: Array<{
    word: string;
    baseForm?: string;
    meaning: string;
    sentenceDe?: string;
    sentenceTranslation?: string;
    grammarNote?: string;
  }>;
}

/**
 * Pre-computes a complete static LesenReaderPack for an exercise:
 * - Full paragraph-by-paragraph translation + key vocab + level grammar rules
 * - Every sentence's translation, difficult words, and target-level grammar rules
 * - Every notable German word's contextual meaning, base form/article, and grammar role
 * Saved permanently to data/assist-cache.json so future clicks are 0ms instant!
 */
export async function generateLesenReaderPack(
  db: DatabaseSchema,
  exercise: SkillDrillExercise
): Promise<LesenReaderPack | null> {
  if (db.aiConfig.provider === "demo") {
    return null;
  }

  const lang = db.profile.nativeLanguage || "English";
  const studyLevel = db.profile.targetLevel || exercise.level || "B1";
  const studyPlanGrammarList = db.mastery.grammarStandards
    .map((g) => g.titleDe)
    .slice(0, 12)
    .join(" | ");

  // Chunk multi-section texts cleanly so no long exercise gets truncated by output token limits
  const chunks: string[] = [];
  if (exercise.sections && exercise.sections.length > 0) {
    let currentChunk = "";
    for (const sec of exercise.sections) {
      const block = `${sec.label}${sec.title ? ` — ${sec.title}` : ""}\n${sec.textDe}`;
      if (currentChunk && currentChunk.length + block.length > 1650) {
        chunks.push(currentChunk);
        currentChunk = block;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${block}` : block;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  } else if (exercise.passageDe?.trim()) {
    chunks.push(exercise.passageDe.trim());
  }

  if (chunks.length === 0) return null;

  const translatedBlocks: string[] = [];
  const allTextVocab: Array<{ german: string; translation: string; note?: string }> = [];
  const allTextGrammar: Array<{ pattern: string; explanation: string }> = [];
  const sentencesMap: Record<string, DrillAssistResult> = {};
  const wordsMap: Record<string, DrillAssistResult> = {};

  for (const chunkText of chunks) {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You build a static, comprehensive ${studyLevel}-level German reading knowledge pack in ${lang} so learners get instant 0ms explanations when clicking ANY word or sentence. Output ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze the German reading text below for a learner studying ${studyLevel}.
OFFICIAL ${studyLevel} GRAMMAR RULES IN STUDY PLAN:
${studyPlanGrammarList || "Passiv, Passiv mit Modalverb, Konjunktiv II, Relativsätze, Nebensätze (weil/da/obwohl/wenn/damit), Infinitiv mit zu, sein + zu + Infinitiv, Genitiv, Adjektivdeklination, Nominalisierung"}

GERMAN TEXT:
${chunkText}

Return ONLY valid JSON with ALL 5 fields populated thoroughly:
{
  "translatedText": "COMPLETE faithful paragraph-by-paragraph translation of the entire German text above into natural ${lang}. Preserve every heading and paragraph break. Zero omissions.",
  "textVocab": [
    { "german": "German word/expression with article/base form", "translation": "meaning in ${lang}", "note": "short usage hint" }
  ],
  "textGrammar": [
    { "pattern": "Rule name (${studyLevel}): „exact German quote from text“", "explanation": "Clear concise explanation in ${lang}" }
  ],
  "sentences": [
    {
      "german": "EXACT German sentence copied verbatim from the text",
      "translation": "Full natural translation of this sentence in ${lang}",
      "difficultWords": [
        { "german": "difficult word in this sentence", "translation": "meaning in ${lang}", "note": "optional article/base form" }
      ],
      "grammarNotes": [
        { "pattern": "${studyLevel} grammar rule + exact words from this sentence", "explanation": "Clear explanation in ${lang}" }
      ]
    }
  ],
  "words": [
    {
      "word": "EXACT German word token as it appears in the text (cover ALL content words: nouns, verbs, adjectives, adverbs, connectors, key prepositions — aim for 20-55 words)",
      "baseForm": "dictionary form with article/plural or infinitive (e.g. 'die Stornierung, -en' or 'unterstützen (Verb)')",
      "meaning": "Exact contextual meaning in ${lang}",
      "sentenceDe": "The sentence from the text containing this word",
      "sentenceTranslation": "Natural ${lang} translation of that sentence",
      "grammarNote": "Brief ${studyLevel} grammatical role/case/tense note in ${lang} (e.g. 'Dativ nach „vor“', 'Passiv mit Modalverb', 'Kausaler Nebensatz mit Verb am Ende')"
    }
  ]
}`,
        },
      ],
      temperature: 0.2,
      jsonMode: true,
      workload: "static",
    });

    const parsed = extractJsonObject<RawPackChunkResponse>(result.text);
    if (!parsed) continue;

    if (parsed.translatedText?.trim()) {
      translatedBlocks.push(parsed.translatedText.trim());
    }

    if (Array.isArray(parsed.textVocab)) {
      for (const v of parsed.textVocab) {
        if (v?.german && v?.translation) {
          allTextVocab.push({
            german: v.german.trim(),
            translation: v.translation.trim(),
            note: v.note?.trim() || undefined,
          });
        }
      }
    }

    if (Array.isArray(parsed.textGrammar)) {
      for (const g of parsed.textGrammar) {
        if (g?.pattern && g?.explanation) {
          allTextGrammar.push({
            pattern: g.pattern.trim(),
            explanation: g.explanation.trim(),
          });
        }
      }
    }

    if (Array.isArray(parsed.sentences)) {
      for (const s of parsed.sentences) {
        if (!s?.german || !s?.translation) continue;
        const normSent = normalizeCacheText(s.german);
        if (!normSent) continue;

        const cleanWords = Array.isArray(s.difficultWords)
          ? s.difficultWords
              .filter((w) => w?.german && w?.translation)
              .slice(0, 6)
          : [];
        const cleanGrammar = Array.isArray(s.grammarNotes)
          ? s.grammarNotes
              .filter((g) => g?.pattern && g?.explanation)
              .slice(0, 4)
          : [];

        sentencesMap[normSent] = {
          title: `Sentence Translation & ${studyLevel} Grammar`,
          body: s.translation.trim(),
          germanExample: s.german.trim(),
          germanExampleTranslation: s.translation.trim(),
          difficultWords: cleanWords.length > 0 ? cleanWords : undefined,
          grammarNotes: cleanGrammar.length > 0 ? cleanGrammar : undefined,
        };

        // Also seed word map from sentence difficultWords as fallback coverage
        for (const dw of cleanWords) {
          const singleTokens = dw.german
            .replace(/^(der|die|das|ein|eine|sich)\s+/i, "")
            .split(/[\s,/]+/)
            .map((t) => normalizeCacheText(t))
            .filter((t) => t.length >= 3);
          for (const tok of singleTokens) {
            if (!wordsMap[tok]) {
              wordsMap[tok] = {
                title: `Word: „${dw.german}“ (${studyLevel} Breakdown)`,
                body: `In this context, „${dw.german}“ means: ${dw.translation}.${
                  dw.note ? ` (${dw.note})` : ""
                }`,
                germanExample: dw.german,
                germanExampleTranslation: s.translation.trim(),
                difficultWords: [dw],
                grammarNotes: cleanGrammar.slice(0, 2),
              };
            }
          }
        }
      }
    }

    if (Array.isArray(parsed.words)) {
      for (const w of parsed.words) {
        if (!w?.word || !w?.meaning) continue;
        const normWord = normalizeCacheText(w.word);
        if (!normWord) continue;

        const baseLabel = w.baseForm?.trim() || w.word.trim();
        wordsMap[normWord] = {
          title: `Word: „${w.word.trim()}“ (${studyLevel} Breakdown)`,
          body: `${baseLabel} — ${w.meaning.trim()}${
            w.grammarNote?.trim() ? `\n\nGrammar in context: ${w.grammarNote.trim()}` : ""
          }`,
          germanExample: w.word.trim(),
          germanExampleTranslation: w.sentenceTranslation?.trim() || undefined,
          difficultWords: [
            {
              german: baseLabel,
              translation: w.meaning.trim(),
              note: w.grammarNote?.trim() || undefined,
            },
          ],
          grammarNotes: w.grammarNote?.trim()
            ? [
                {
                  pattern: `„${w.word.trim()}“ (${baseLabel})`,
                  explanation: w.grammarNote.trim(),
                },
              ]
            : undefined,
        };
      }
    }
  }

  if (translatedBlocks.length === 0 && Object.keys(sentencesMap).length === 0) {
    return null;
  }

  // Deduplicate text-level vocab & grammar across chunks
  const dedupVocab: Array<{ german: string; translation: string; note?: string }> = [];
  const seenV = new Set<string>();
  for (const v of allTextVocab) {
    const k = normalizeCacheText(v.german);
    if (!seenV.has(k)) {
      seenV.add(k);
      dedupVocab.push(v);
    }
  }

  const dedupGrammar: Array<{ pattern: string; explanation: string }> = [];
  const seenG = new Set<string>();
  for (const g of allTextGrammar) {
    const k = normalizeCacheText(g.pattern);
    if (!seenG.has(k)) {
      seenG.add(k);
      dedupGrammar.push(g);
    }
  }

  return {
    exerciseId: exercise.id,
    level: studyLevel,
    lang,
    generatedAt: new Date().toISOString(),
    fullTranslation: {
      title: `Full Translation & ${studyLevel} Study Guide — ${exercise.title}`,
      body: translatedBlocks.join("\n\n"),
      difficultWords: dedupVocab.slice(0, 12),
      grammarNotes: dedupGrammar.slice(0, 8),
    },
    sentences: sentencesMap,
    words: wordsMap,
  };
}

/**
 * Pre-computes ALL per-question Answer Analyses (with exact German quote, full-sentence
 * translation, difficult words, and grammar notes) PLUS the Full Answer Key for a
 * Hören or Lesen exercise in ONE batched AI call, and stores them permanently in data/assist-cache.json!
 */
export async function generateQuestionAnalysesBatch(
  db: DatabaseSchema,
  exercise: SkillDrillExercise
): Promise<number> {
  if (db.aiConfig.provider === "demo") return 0;
  const questions = exercise.questions ?? [];
  if (questions.length === 0) return 0;

  const lang = db.profile.nativeLanguage || "English";
  const studyLevel = db.profile.targetLevel || exercise.level || "B1";

  const fullText =
    exercise.sections && exercise.sections.length > 0
      ? exercise.sections
          .map(
            (s) =>
              `${s.label}${s.title ? ` — ${s.title}` : ""}\n${s.textDe}`
          )
          .join("\n\n")
      : exercise.passageDe || "";

  const result = await generateWithAi(db.aiConfig, {
    messages: [
      {
        role: "system",
        content: `You are a precise German ${studyLevel} Goethe exam tutor pre-building a permanent static Answer Analysis database in ${lang} so learners never spend repeat API calls on static listening/reading questions. Output ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Exercise: ${exercise.title} (${exercise.examPartLabel})
FULL GERMAN PASSAGE / TRANSCRIPT:
${fullText}

QUESTIONS & VERIFIED CORRECT ANSWERS:
${questions
  .map(
    (q, idx) =>
      `[${q.id}] Q${idx + 1}: ${q.questionDe}
Options: ${q.options.map((o, oi) => `${oi + 1}) ${o}`).join(" | ")}
Verified Correct: #${q.correctIndex + 1} (${q.options[q.correctIndex]})
Verified Note: ${q.explanation}`
  )
  .join("\n\n")}

Return ONLY valid JSON containing an analysis for EVERY question ID above:
{
  "overallSummary": "2-sentence overview of the exercise answer key in ${lang}",
  "analyses": [
    {
      "questionId": "exact question id from [brackets] above",
      "title": "Short heading (e.g. 'Answer Analysis · Aufgabe 1')",
      "body": "Clear explanation in ${lang} of why the verified option is right and why the other option(s) are traps.",
      "germanExample": "Exact German evidence quote from the passage",
      "germanExampleTranslation": "Natural ${lang} translation of that German evidence quote",
      "difficultWords": [
        { "german": "difficult German word/idiom from evidence", "translation": "meaning in ${lang}", "note": "optional brief note" }
      ],
      "grammarNotes": [
        { "pattern": "${studyLevel} grammar pattern in the quote", "explanation": "Short clear explanation in ${lang}" }
      ]
    }
  ]
}`,
      },
    ],
    temperature: 0.25,
    jsonMode: true,
    maxTokens: 4096,
    workload: "static",
  });

  const parsed = extractJsonObject<{
    overallSummary?: string;
    analyses?: Array<{
      questionId: string;
      title?: string;
      body?: string;
      germanExample?: string;
      germanExampleTranslation?: string;
      difficultWords?: Array<{ german: string; translation: string; note?: string }>;
      grammarNotes?: Array<{ pattern: string; explanation: string }>;
    }>;
  }>(result.text);

  if (!parsed?.analyses?.length) return 0;

  const updates: Array<{ key: string; result: DrillAssistResult }> = [];
  const validQIds = new Set(questions.map((q) => q.id));
  const bulletLines: string[] = [];

  for (const item of parsed.analyses) {
    if (!item?.questionId || !validQIds.has(item.questionId) || !item.body) {
      continue;
    }
    const q = questions.find((x) => x.id === item.questionId)!;
    const assistRes: DrillAssistResult = {
      title: item.title || `Answer Analysis`,
      body: item.body.trim(),
      germanExample: item.germanExample?.trim() || undefined,
      germanExampleTranslation:
        item.germanExampleTranslation?.trim() || undefined,
      difficultWords: Array.isArray(item.difficultWords)
        ? item.difficultWords.filter((w) => w?.german && w?.translation).slice(0, 6)
        : undefined,
      grammarNotes: Array.isArray(item.grammarNotes)
        ? item.grammarNotes.filter((g) => g?.pattern && g?.explanation).slice(0, 3)
        : undefined,
    };

    updates.push({
      key: makeQuestionAssistKey("analyze_answer", exercise.id, q.id, lang),
      result: assistRes,
    });
    bulletLines.push(
      `Q${q.itemNumber ?? ""}: ${q.options[q.correctIndex]} — ${
        item.germanExample
          ? `„${item.germanExample}“ (${item.germanExampleTranslation || q.explanation})`
          : q.explanation
      }`
    );
  }

  if (bulletLines.length > 0) {
    updates.push({
      key: makeModelAnswerKey(exercise.id, lang, studyLevel),
      result: {
        title: `Full Verified Answer Key — ${exercise.title}`,
        body:
          parsed.overallSummary?.trim() ||
          `Verified answers and exact German text evidence for all ${questions.length} questions:`,
        bulletHighlights: bulletLines,
      },
    });
  }

  setCachedEntriesBatch(updates);
  return updates.length;
}

