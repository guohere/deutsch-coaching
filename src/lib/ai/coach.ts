import { getCuratedResearch, getStarterModules } from "../curriculum";
import { filterAvailableSpeakingBank } from "../speaking-bank";
import {
  Bottleneck,
  DatabaseSchema,
  ModuleCategory,
  SessionDebrief,
  SessionMessage,
  SessionPhase,
  SessionRecord,
  StudyModule,
  StudyPlan,
  TopicResearchResult,
  TurnCorrection,
} from "../types";
import { extractJsonObject, generateWithAi } from "./providers";

function formatBottlenecksForPrompt(bottlenecks: Bottleneck[]): string {
  const active = bottlenecks.filter((b) => b.severity !== "mastered").slice(0, 6);
  if (active.length === 0) return "None recorded yet.";
  return active
    .map(
      (b) =>
        `- [${b.severity.toUpperCase()} | ${b.category}] ${b.title}: ${b.description} (Typical mistake: "${b.exampleMistake}" -> Better: "${b.betterGerman}")`
    )
    .join("\n");
}

function getCoachStyleInstruction(style: DatabaseSchema["profile"]["coachStyle"]) {
  if (style === "encouraging") {
    return "Be warm, patient, and encouraging. Gently rephrase mistakes without intimidating the learner.";
  }
  if (style === "exam_strict") {
    return "Act like a realistic Goethe/telc examiner: stay polite, keep exam pacing tight, push for B1/B2 connectors, and point out exam-relevant grammar errors clearly.";
  }
  return "Be a supportive yet structured personal speaking coach: keep the German conversation natural and flowing while giving crisp, high-impact corrections.";
}

export async function researchTopicsForGoal(
  db: DatabaseSchema
): Promise<TopicResearchResult> {
  const { profile, aiConfig } = db;
  const fallback = getCuratedResearch(
    profile.currentLevel,
    profile.targetLevel,
    profile.goalTitle
  );

  if (aiConfig.provider === "demo") {
    return fallback;
  }

  const prompt = `You are a German CEFR & Goethe/telc exam curriculum specialist.
Research the latest speaking requirements and high-frequency topics for this learner:
- Current Level: ${profile.currentLevel}
- Target Level: ${profile.targetLevel}
- Goal: ${profile.goalTitle}
- Goal Details: ${profile.goalDetails}
- Support Language for explanations: ${profile.nativeLanguage}

Return ONLY a valid JSON object matching this exact structure (no markdown commentary outside JSON):
{
  "summary": "2-3 sentence overview of what this level/exam speaking test requires",
  "examFormat": [
    {
      "part": "e.g. Teil 1: Gemeinsam etwas planen",
      "duration": "e.g. 3-4 min",
      "description": "What the candidate must do",
      "tips": ["Concrete speaking tip 1", "Concrete speaking tip 2"]
    }
  ],
  "canDoCompetencies": ["CEFR Can-Do statement 1", "statement 2", "statement 3", "statement 4", "statement 5"],
  "trendingTopics": [
    {
      "topicDe": "German topic title",
      "topicEn": "Meaning in ${profile.nativeLanguage}",
      "whyImportant": "Why this topic appears frequently in exams/real life",
      "samplePromptDe": "Realistic German exam/speaking prompt"
    }
  ],
  "keyGrammarTargets": ["Grammar target 1", "Grammar target 2", "Grammar target 3", "Grammar target 4", "Grammar target 5"]
}
Provide 2-3 examFormat parts and 5-6 trendingTopics.`;

  try {
    const useSearch = aiConfig.provider === "gemini";
    const result = await generateWithAi(aiConfig, {
      messages: [
        {
          role: "system",
          content:
            "You output accurate, up-to-date German CEFR & Goethe/telc exam speaking blueprints strictly as valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      jsonMode: true,
      useGoogleSearch: useSearch,
    });

    const parsed = extractJsonObject<
      Omit<
        TopicResearchResult,
        "id" | "goal" | "currentLevel" | "targetLevel" | "searchedAt" | "sourceMode" | "citations"
      >
    >(result.text);

    if (!parsed || !Array.isArray(parsed.trendingTopics) || parsed.trendingTopics.length === 0) {
      return fallback;
    }

    return {
      id: `research-${Date.now()}`,
      goal: profile.goalTitle,
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
      searchedAt: new Date().toISOString(),
      sourceMode: result.usedSearch ? "live_search" : "ai_knowledge",
      summary: parsed.summary || fallback.summary,
      examFormat:
        Array.isArray(parsed.examFormat) && parsed.examFormat.length > 0
          ? parsed.examFormat
          : fallback.examFormat,
      canDoCompetencies:
        Array.isArray(parsed.canDoCompetencies) && parsed.canDoCompetencies.length > 0
          ? parsed.canDoCompetencies
          : fallback.canDoCompetencies,
      trendingTopics: parsed.trendingTopics,
      keyGrammarTargets:
        Array.isArray(parsed.keyGrammarTargets) && parsed.keyGrammarTargets.length > 0
          ? parsed.keyGrammarTargets
          : fallback.keyGrammarTargets,
      citations: result.citations,
    };
  } catch (err) {
    console.error("Topic research fallback:", err);
    return fallback;
  }
}

export async function generatePersonalizedPlan(
  db: DatabaseSchema,
  customNote?: string
): Promise<StudyPlan> {
  const { profile, aiConfig, latestResearch, memory } = db;
  const fallbackModules = getStarterModules(
    profile.currentLevel,
    profile.targetLevel,
    profile.goalTitle
  );

  const fallbackPlan: StudyPlan = {
    id: `plan-${Date.now()}`,
    title: `${profile.currentLevel} -> ${profile.goalTitle} Speaking Plan`,
    summary: `Personalized ${profile.dailyMinutes}-min/day speaking roadmap bridging ${profile.currentLevel} to ${profile.targetLevel}, targeting your active bottlenecks and exam tasks.`,
    updatedAt: new Date().toISOString(),
    modules: fallbackModules,
  };

  if (aiConfig.provider === "demo") {
    return fallbackPlan;
  }

  const topicsSummary = latestResearch
    ? latestResearch.trendingTopics
        .map((t) => `- ${t.topicDe} (${t.topicEn}): ${t.samplePromptDe}`)
        .join("\n")
    : "Standard Goethe/CEFR speaking topics";

  const prompt = `Design a proactive, editable German speaking study plan for this learner:
- Current Level: ${profile.currentLevel}
- Target Level: ${profile.targetLevel}
- Goal: ${profile.goalTitle} (${profile.goalDetails})
- Daily Practice Time: ${profile.dailyMinutes} minutes
- Support Language: ${profile.nativeLanguage}
- Extra User Request: ${customNote?.trim() || "None"}

Researched Exam Topics:
${topicsSummary}

Learner's Active Bottlenecks from Memory (prioritize fixing these!):
${formatBottlenecksForPrompt(memory.bottlenecks)}

Return ONLY valid JSON:
{
  "title": "Short plan title",
  "summary": "1-2 sentence rationale explaining how this plan bridges their level and fixes their bottlenecks",
  "modules": [
    {
      "title": "Clear module title in ${profile.nativeLanguage}",
      "titleDe": "German module title",
      "category": "one of: exam_teil1_planning | exam_teil2_presentation | exam_teil3_discussion | everyday_roleplay | bottleneck_drill | listening_qa",
      "targetLevel": "${profile.targetLevel}",
      "durationMinutes": ${Math.max(8, Math.min(20, profile.dailyMinutes))},
      "scenarioPrompt": "Konkrete Aufgabenstellung auf Deutsch (Situation und die 4 Leitpunkte auf Deutsch beschreiben)",
      "coachRole": "Rolle des Gesprächspartners auf Deutsch",
      "learnerGoal": "Klares Lernziel für die Sprechaufgabe auf Deutsch",
      "grammarFocus": ["Grammar target 1", "Grammar target 2"],
      "keyVocabulary": ["German phrase 1", "German phrase 2", "German phrase 3", "German phrase 4"]
    }
  ]
}
Create exactly 6 varied, high-value modules ordered from confidence-building to full exam readiness.`;

  try {
    const result = await generateWithAi(aiConfig, {
      messages: [
        {
          role: "system",
          content:
            "You are an expert German speaking coach designing structured CEFR/Goethe practice modules. Output strictly valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.55,
      jsonMode: true,
    });

    const parsed = extractJsonObject<{
      title?: string;
      summary?: string;
      modules?: Array<Partial<StudyModule>>;
    }>(result.text);

    if (!parsed || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
      return fallbackPlan;
    }

    const validCategories: ModuleCategory[] = [
      "exam_teil1_planning",
      "exam_teil2_presentation",
      "exam_teil3_discussion",
      "everyday_roleplay",
      "bottleneck_drill",
      "listening_qa",
    ];

    const modules: StudyModule[] = parsed.modules.map((m, idx) => ({
      id: `mod-${Date.now()}-${idx}`,
      order: idx,
      title: m.title || `Module ${idx + 1}`,
      titleDe: m.titleDe || m.title || `Modul ${idx + 1}`,
      category: validCategories.includes(m.category as ModuleCategory)
        ? (m.category as ModuleCategory)
        : "everyday_roleplay",
      targetLevel: profile.targetLevel,
      durationMinutes: Number(m.durationMinutes) || profile.dailyMinutes || 10,
      scenarioPrompt:
        m.scenarioPrompt || "Hold a guided German conversation on this topic.",
      coachRole: m.coachRole || "German speaking coach",
      learnerGoal:
        m.learnerGoal || "Speak in connected German sentences and react naturally.",
      grammarFocus: Array.isArray(m.grammarFocus) ? m.grammarFocus.slice(0, 4) : [],
      keyVocabulary: Array.isArray(m.keyVocabulary) ? m.keyVocabulary.slice(0, 6) : [],
      status: "queued",
      source: "generated",
      completedCount: 0,
    }));

    return {
      id: `plan-${Date.now()}`,
      title: parsed.title || fallbackPlan.title,
      summary: parsed.summary || fallbackPlan.summary,
      updatedAt: new Date().toISOString(),
      modules,
    };
  } catch (err) {
    console.error("Plan generation fallback:", err);
    return fallbackPlan;
  }
}

export async function suggestAdditionalModules(
  db: DatabaseSchema,
  focusTopic?: string,
  targetCategory?: ModuleCategory | "all",
  count = 4
): Promise<Array<Omit<StudyModule, "id" | "order" | "completedCount">>> {
  const { profile, aiConfig, memory } = db;
  const availableFromBank = filterAvailableSpeakingBank(
    db.plan.modules,
    targetCategory
  );

  // Pull from our verified 30+ Goethe Speaking Bank for instant, zero-hallucination fallbacks
  const bankFallback: Array<Omit<StudyModule, "id" | "order" | "completedCount">> =
    availableFromBank.slice(0, count).map((item) => ({
      title: item.title,
      titleDe: item.titleDe,
      category: item.category,
      targetLevel: profile.targetLevel,
      durationMinutes: item.durationMinutes,
      scenarioPrompt: item.scenarioPrompt,
      coachRole: item.coachRole,
      learnerGoal: item.learnerGoal,
      grammarFocus: item.grammarFocus,
      keyVocabulary: item.keyVocabulary,
      status: "queued" as const,
      source: "generated" as const,
    }));

  if (aiConfig.provider === "demo") {
    return bankFallback.length > 0
      ? bankFallback
      : [
          {
            title: focusTopic
              ? `Custom Focus: ${focusTopic}`
              : "Goethe B1 Teil 1: Planning a Neighborhood Event",
            titleDe: focusTopic
              ? `Sprachtraining: ${focusTopic}`
              : "Teil 1: Ein Nachbarschaftsfest planen",
            category:
              targetCategory && targetCategory !== "all"
                ? targetCategory
                : "exam_teil1_planning",
            targetLevel: profile.targetLevel,
            durationMinutes: 10,
            scenarioPrompt:
              "Plan a Saturday street gathering with your neighbor: date/time, food & drinks, music, and cleanup.",
            coachRole: "Friendly neighbor",
            learnerGoal: "Cover all 4 planning points using Konjunktiv II.",
            grammarFocus: ["Konjunktiv II", "Nebensätze"],
            keyVocabulary: ["Ich schlage vor, dass...", "Was hältst du davon?"],
            status: "queued",
            source: "generated",
          },
        ];
  }

  const existingTitles = db.plan.modules
    .slice(0, 25)
    .map((m) => `- ${m.titleDe}`)
    .join("\n");

  const categoryDirective =
    targetCategory && targetCategory !== "all"
      ? `IMPORTANT: ALL ${count} modules MUST have "category": "${targetCategory}".${
          targetCategory === "exam_teil1_planning"
            ? " Design authentic Goethe B1 Teil 1 collaborative planning tasks with 4 concrete points to negotiate (Wann/Wo/Was/Wie)."
            : targetCategory === "exam_teil2_presentation"
            ? " Design authentic Goethe B1 Teil 2 3-minute presentation topics following the 4-part Goethe structure (Personal experience, Situation in home country, Pros & Cons, Conclusion)."
            : targetCategory === "exam_teil3_discussion"
            ? " Design authentic Goethe B1 Teil 3 partner presentation feedback & follow-up Q&A tasks."
            : ""
        }`
      : "Include a good mix of Goethe Teil 1 (Planning), Teil 2 (Presentation), Teil 3 (Feedback), and Bottleneck Drills.";

  const prompt = `Suggest ${count} NEW German speaking practice modules to ADD to the learner's existing exercise list.
- Level: ${profile.currentLevel} -> ${profile.targetLevel} (${profile.goalTitle})
- Support Language: ${profile.nativeLanguage}
- Requested Focus Topic: ${focusTopic?.trim() || "High-frequency Goethe speaking patterns & active bottlenecks"}
- ${categoryDirective}

Existing Modules (DO NOT duplicate any of these):
${existingTitles}

Active Bottlenecks:
${formatBottlenecksForPrompt(memory.bottlenecks)}

Return ONLY valid JSON:
{
  "modules": [
    {
      "title": "Module title in ${profile.nativeLanguage}",
      "titleDe": "German title (start with 'Teil 1:', 'Teil 2:', or 'Teil 3:' when applicable)",
      "category": "exam_teil1_planning | exam_teil2_presentation | exam_teil3_discussion | everyday_roleplay | bottleneck_drill | listening_qa",
      "durationMinutes": 10,
      "scenarioPrompt": "Konkrete Aufgabenstellung auf Deutsch mit allen Leitpunkten",
      "coachRole": "Rolle des Gesprächspartners auf Deutsch",
      "learnerGoal": "Konkretes Lernziel für den Lernenden auf Deutsch",
      "grammarFocus": ["item1", "item2"],
      "keyVocabulary": ["phrase1", "phrase2", "phrase3", "phrase4"]
    }
  ]
}`;

  try {
    const result = await generateWithAi(aiConfig, {
      messages: [
        { role: "system", content: "Return strictly valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const parsed = extractJsonObject<{ modules?: Array<Partial<StudyModule>> }>(
      result.text
    );
    if (!parsed?.modules?.length) return bankFallback;

    return parsed.modules.slice(0, count).map((m) => ({
      title: m.title || "Targeted Practice Module",
      titleDe: m.titleDe || m.title || "Gezieltes Modul",
      category:
        targetCategory && targetCategory !== "all"
          ? targetCategory
          : (m.category as ModuleCategory) || "exam_teil1_planning",
      targetLevel: profile.targetLevel,
      durationMinutes: Number(m.durationMinutes) || 10,
      scenarioPrompt: m.scenarioPrompt || "Guided speaking session.",
      coachRole: m.coachRole || "German speaking coach",
      learnerGoal: m.learnerGoal || "Practice speaking fluently.",
      grammarFocus: Array.isArray(m.grammarFocus) ? m.grammarFocus : [],
      keyVocabulary: Array.isArray(m.keyVocabulary) ? m.keyVocabulary : [],
      status: "queued",
      source: "generated",
    }));
  } catch {
    return bankFallback;
  }
}

export interface CoachTurnOutput {
  coachTextDe: string;
  translation: string;
  nextPhase: SessionPhase;
  correction: TurnCorrection | null;
  hints: string[];
  coachNote: string;
  shouldOfferDebrief: boolean;
}

function buildDemoOpening(
  db: DatabaseSchema,
  module: StudyModule,
  targetBottleneck?: Bottleneck
): CoachTurnOutput {
  const focusHint = targetBottleneck
    ? `Heute achten wir besonders auf: ${targetBottleneck.title}.`
    : `Heute üben wir: ${module.titleDe}.`;

  const greeting =
    module.category === "exam_teil1_planning"
      ? `Hallo ${db.profile.name}! Schön, dass du da bist. ${focusHint} Lass uns kurz warm werden: Wie geht es dir heute, und bist du bereit für unsere Planungsaufgabe?`
      : module.category === "exam_teil2_presentation"
      ? `Hallo ${db.profile.name}! Willkommen zu deiner Präsentationsübung über „${module.titleDe}“. ${focusHint} Zum Aufwärmen: Hast du schon eigene Erfahrungen mit diesem Thema gemacht?`
      : `Hallo ${db.profile.name}! Schön, dich wieder zu hören. ${focusHint} Zum Aufwärmen: Wie war dein Tag heute, und hast du heute schon ein bisschen Deutsch gesprochen?`;

  return {
    coachTextDe: greeting,
    translation: `Hello ${db.profile.name}! Great to have you here. Today we're focusing on "${module.title}". As a quick warm-up, answer in 1–2 German sentences!`,
    nextPhase: "warmup",
    correction: null,
    hints: [
      "Mir geht es gut, danke! Ich bin bereit, weil...",
      "Heute habe ich schon ein bisschen geübt, und...",
      "Ja, ich habe eigene Erfahrungen damit, denn...",
    ],
    coachNote:
      "Demo Coach Mode is active. Connect free Gemini/Groq or local Ollama in Settings for fully adaptive AI conversations.",
    shouldOfferDebrief: false,
  };
}

function buildDemoReply(
  session: SessionRecord,
  module: StudyModule,
  learnerTextDe: string
): CoachTurnOutput {
  const turn = session.turnCount + 1;
  const lower = learnerTextDe.toLowerCase();

  // Simple heuristic German feedback for Demo Mode
  let correction: TurnCorrection | null = null;
  if (lower.includes("weil ich ") && !lower.match(/weil ich .*(bin|habe|kann|möchte|will|muss|gehe|lerne|wohne|arbeite|finde|denke)\.?$/)) {
    correction = {
      original: learnerTextDe,
      corrected: "Tipp: Achte bei 'weil' darauf, dass das konjugierte Verb ganz am Ende steht!",
      explanation:
        "In German subordinate clauses (weil, dass, obwohl), the conjugated verb moves to the very end.",
      bottleneckTag: "Verb at the end in Nebensätze",
    };
  } else if (learnerTextDe.trim().split(/\s+/).length < 5) {
    correction = {
      original: learnerTextDe,
      corrected: `${learnerTextDe.replace(/\.$/, "")}, weil ich das sehr interessant finde.`,
      explanation:
        "Try extending short answers into full B1 sentences using 'weil', 'aber', or 'deshalb'.",
      bottleneckTag: "Connected B1 sentences",
    };
  }

  if (turn === 1) {
    return {
      coachTextDe: `Super, danke für deinen Einstieg! Jetzt starten wir direkt mit unserer Aufgabe: ${module.titleDe}. Stell dir vor, wir sprechen im echten Gespräch darüber. Was ist dein erster Vorschlag oder dein erster Punkt?`,
      translation: `Great warm-up! Now let's jump straight into our main task: ${module.title}. What is your first suggestion or main point?`,
      nextPhase: "practice",
      correction,
      hints:
        module.keyVocabulary.length > 0
          ? module.keyVocabulary.slice(0, 3)
          : [
              "Ich schlage vor, dass wir...",
              "Zuerst möchte ich sagen, dass...",
              "Meiner Meinung nach...",
            ],
      coachNote: "Entering Main Guided Practice phase.",
      shouldOfferDebrief: false,
    };
  }

  if (turn === 2) {
    return {
      coachTextDe: `Das klingt sehr gut! Aber ich habe noch eine Rückfrage dazu: Was machen wir, wenn es ein kleines Problem gibt — oder was ist für dich der wichtigste Vorteil und Nachteil dabei?`,
      translation: `That sounds really good! Follow-up question: what should we do if there's a small problem — or what's the biggest advantage and disadvantage for you?`,
      nextPhase: "practice",
      correction,
      hints: [
        "Ein großer Vorteil ist, dass...",
        "Auf der anderen Seite könnte es schwierig sein, weil...",
        "In diesem Fall könnten wir...",
      ],
      coachNote: "Great momentum — try adding a connector like 'obwohl' or 'einerseits... andererseits'.",
      shouldOfferDebrief: false,
    };
  }

  if (turn === 3) {
    return {
      coachTextDe: `Klasse! Lass uns jetzt eine kurze Korrektur-Übung machen, damit der Satz richtig sitzt. Sag bitte laut und flüssig auf Deutsch: „Ich schlage vor, dass wir das gemeinsam planen, weil wir dann mehr Ideen haben.“`,
      translation: `Awesome! Now for a quick speaking drill so the structure sticks. Say aloud smoothly: "I suggest that we plan this together, because then we have more ideas."`,
      nextPhase: "correction_drill",
      correction,
      hints: [
        "Ich schlage vor, dass wir das gemeinsam planen, weil wir dann mehr Ideen haben.",
      ],
      coachNote: "Correction Drill phase: repeat the target structure aloud!",
      shouldOfferDebrief: false,
    };
  }

  return {
    coachTextDe: `Wunderbar gesprochen! Du hast alle Phasen dieser Übung gemeistert. Klicke jetzt unten auf „Finish & Save to Memory“, um dein detailliertes Feedback zu sehen und deine Lern-Memory zu aktualisieren.`,
    translation: `Wonderfully spoken! You've completed all phases of this exercise. Click "Finish & Save to Memory" below to view your scorecard and update your learner memory.`,
    nextPhase: "debrief",
    correction,
    hints: ["Vielen Dank für das Training!"],
    coachNote: "Ready for your Session Debrief & Memory Update.",
    shouldOfferDebrief: true,
  };
}

export async function generateCoachOpening(
  db: DatabaseSchema,
  module: StudyModule,
  targetBottleneck?: Bottleneck
): Promise<CoachTurnOutput> {
  if (db.aiConfig.provider === "demo") {
    return buildDemoOpening(db, module, targetBottleneck);
  }

  const { profile, memory } = db;
  const bottleneckContext = targetBottleneck
    ? `PRIORITY BOTTLENECK TO TARGET TODAY: ${targetBottleneck.title} — ${targetBottleneck.description}`
    : formatBottlenecksForPrompt(memory.bottlenecks);

  const systemPrompt = `You are SprachCoach, a proactive, human-like German speaking coach.
Unlike passive assistants, YOU lead the session clearly from start to finish so the learner never wonders what to say next.
${getCoachStyleInstruction(profile.coachStyle)}

LEARNER PROFILE:
- Name: ${profile.name}
- Current Level: ${profile.currentLevel} -> Target: ${profile.targetLevel} (${profile.goalTitle})
- Support Language (for translations & notes): ${profile.nativeLanguage}
- Last Session Recap: ${memory.lastSessionRecap}

ACTIVE BOTTLENECKS IN MEMORY:
${bottleneckContext}

TODAY'S MODULE:
- Title: ${module.title} (${module.titleDe})
- Category: ${module.category}
- Scenario: ${module.scenarioPrompt}
- Your Role: ${module.coachRole}
- Learner Goal: ${module.learnerGoal}
- Target Grammar: ${module.grammarFocus.join(", ")}
- Key Phrases: ${module.keyVocabulary.join(", ")}

TASK: Open the session in Phase 1 ("warmup").
Greet the learner warmly in natural spoken German calibrated slightly above ${profile.currentLevel} (toward ${profile.targetLevel}), briefly set up today's practice in 1–2 sentences, and ask ONE clear, easy-to-answer opening question in German so they immediately start speaking.
HUMAN VOICE-AGENT SPEECH STYLE (for TTS):
- Write "coachTextDe" for the EAR, not the eye: use short, natural spoken sentences (2–3 sentences max), conversational German discourse markers ("Ach, hallo!", "Na klar,", "Also,", "Ehrlich gesagt,", "Übrigens,"), and natural modal particles ("mal", "eigentlich", "doch", "ja").
- Never use slashes (like "Freund/in"), abbreviations ("z.B."), or parenthetical notes inside "coachTextDe".
- Example spoken opening rhythm: "Hallo! Schön, dass du da bist. Unser Freund Tim zieht ja diesen Sonntag um, und wir wollen ihm dabei ein bisschen helfen. Hast du am Sonntagvormittag eigentlich schon was vor?"

Return ONLY valid JSON:
{
  "coachTextDe": "Spoken German opening message (2-4 sentences)",
  "translation": "Natural translation into ${profile.nativeLanguage}",
  "nextPhase": "warmup",
  "correction": null,
  "hints": ["German starter phrase 1", "German starter phrase 2", "German starter phrase 3"],
  "coachNote": "Brief 1-sentence coaching tip in ${profile.nativeLanguage} about what to focus on today",
  "shouldOfferDebrief": false
}`;

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Start today's guided German speaking session now.",
        },
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<CoachTurnOutput>>(result.text);
    if (!parsed?.coachTextDe) {
      return buildDemoOpening(db, module, targetBottleneck);
    }

    return {
      coachTextDe: parsed.coachTextDe,
      translation: parsed.translation || "",
      nextPhase: "warmup",
      correction: null,
      hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : [],
      coachNote: parsed.coachNote || "",
      shouldOfferDebrief: false,
    };
  } catch (err) {
    console.error("Coach opening fallback:", err);
    return buildDemoOpening(db, module, targetBottleneck);
  }
}

export async function generateCoachTurn(
  db: DatabaseSchema,
  session: SessionRecord,
  module: StudyModule,
  learnerTextDe: string,
  targetBottleneck?: Bottleneck
): Promise<CoachTurnOutput> {
  if (db.aiConfig.provider === "demo") {
    return buildDemoReply(session, module, learnerTextDe);
  }

  const { profile, memory } = db;
  const nextTurnNum = session.turnCount + 1;

  // Deterministic phase guidance so the coach proactively moves the session forward!
  let phaseDirective = "";
  if (nextTurnNum === 1) {
    phaseDirective =
      "Move from 'warmup' into 'practice'. React briefly to their warm-up answer, then immediately kick off the main scenario/exam roleplay in character with a concrete German prompt.";
  } else if (nextTurnNum >= 2 && nextTurnNum <= 4) {
    phaseDirective =
      "Stay in 'practice'. Stay fully in character for the scenario/exam task. React naturally to what the learner just said, challenge them slightly (e.g. a polite counter-suggestion in Teil 1, next presentation point in Teil 2, or follow-up question in Teil 3), and keep them talking in German.";
  } else if (nextTurnNum === 5) {
    phaseDirective =
      "Move to 'correction_drill'. Briefly wrap up the roleplay in German, then pick the single highest-impact grammar or phrasing mistake from this conversation and ask the learner to repeat one natural German upgrade sentence aloud.";
  } else {
    phaseDirective =
      "Move to 'debrief' (set shouldOfferDebrief: true). Praise their effort on the correction drill in German and invite them to click 'Finish & Save to Memory' to see their full scorecard.";
  }

  const historyMessages = session.messages.slice(-10).map((m) => ({
    role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user",
    content: m.textDe,
  }));

  const systemPrompt = `You are SprachCoach, a proactive German speaking coach guiding a live voice session.
${getCoachStyleInstruction(profile.coachStyle)}

LEARNER: ${profile.name} | Level: ${profile.currentLevel} -> ${profile.targetLevel} (${profile.goalTitle}) | Support language: ${profile.nativeLanguage}
MODULE: ${module.title} (${module.titleDe}) | Category: ${module.category}
SCENARIO: ${module.scenarioPrompt}
COACH ROLE: ${module.coachRole}
LEARNER GOAL: ${module.learnerGoal}
GRAMMAR FOCUS: ${module.grammarFocus.join(", ")}
ACTIVE BOTTLENECKS:
${
  targetBottleneck
    ? `- [TARGET] ${targetBottleneck.title}: ${targetBottleneck.description}`
    : formatBottlenecksForPrompt(memory.bottlenecks)
}

CURRENT TURN: ${nextTurnNum}
PHASE DIRECTIVE: ${phaseDirective}

RULES:
1. Speak ONLY authentic, human-sounding spoken German in "coachTextDe" (2–3 short conversational sentences max so TTS sounds like a real human partner!).
   - Start with a natural spoken German reaction/backchannel to what they just said (e.g. "Ach so, verstehe!", "Ja, stimmt, das ist eine super Idee!", "Na klar, das macht Sinn!", "Ehrlich gesagt sehe ich das genauso,", "Hm, guter Punkt, aber...").
   - Use natural German modal particles ("doch", "eigentlich", "ja", "mal", "eben") and conversational rhythm.
   - NEVER use written abbreviations ("z.B.", "bzw."), slashes ("Freund/in"), or bullet points inside "coachTextDe".
2. Analyze the learner's latest German utterance carefully. If there is a meaningful grammar/word-order/vocabulary mistake OR a much more natural B1/B2 phrasing, fill "correction". If their German was already completely natural and accurate, set "correction" to null.
3. Provide 2-3 short, practical German starter phrases in "hints" to help the learner respond to your latest message if they get stuck.
4. Return ONLY valid JSON matching this schema:
{
  "coachTextDe": "Your spoken German response",
  "translation": "Translation of coachTextDe into ${profile.nativeLanguage}",
  "nextPhase": "warmup | practice | correction_drill | debrief",
  "correction": {
    "original": "what learner said",
    "corrected": "more natural / correct German version",
    "explanation": "brief, crystal-clear explanation in ${profile.nativeLanguage}",
    "bottleneckTag": "short skill tag e.g. Nebensatz word order"
  } | null,
  "hints": ["German hint 1", "German hint 2"],
  "coachNote": "Optional 1-sentence coaching insight in ${profile.nativeLanguage}",
  "shouldOfferDebrief": false
}`;

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: learnerTextDe },
      ],
      temperature: 0.65,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<CoachTurnOutput>>(result.text);
    if (!parsed?.coachTextDe) {
      return buildDemoReply(session, module, learnerTextDe);
    }

    const validPhases: SessionPhase[] = [
      "warmup",
      "practice",
      "correction_drill",
      "debrief",
    ];
    const nextPhase = validPhases.includes(parsed.nextPhase as SessionPhase)
      ? (parsed.nextPhase as SessionPhase)
      : nextTurnNum >= 6
      ? "debrief"
      : nextTurnNum === 5
      ? "correction_drill"
      : "practice";

    return {
      coachTextDe: parsed.coachTextDe,
      translation: parsed.translation || "",
      nextPhase,
      correction: parsed.correction?.corrected ? parsed.correction : null,
      hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : [],
      coachNote: parsed.coachNote || "",
      shouldOfferDebrief: Boolean(parsed.shouldOfferDebrief || nextPhase === "debrief"),
    };
  } catch (err) {
    console.error("Coach turn fallback:", err);
    return buildDemoReply(session, module, learnerTextDe);
  }
}

export async function generateSessionDebrief(
  db: DatabaseSchema,
  session: SessionRecord,
  module: StudyModule
): Promise<SessionDebrief> {
  const learnerMessages = session.messages.filter((m) => m.role === "learner");
  const inlineCorrections = session.messages
    .map((m) => m.correction)
    .filter((c): c is TurnCorrection => Boolean(c));

  const fallbackDebrief: SessionDebrief = {
    overallScore: Math.min(92, 68 + learnerMessages.length * 4),
    scores: {
      fluency: 74,
      grammar: 70,
      vocabulary: 76,
      taskCompletion: Math.min(95, 70 + learnerMessages.length * 5),
    },
    praise:
      "You stayed engaged in German and pushed through the guided conversation without stalling.",
    summary: `Completed "${module.title}" across ${learnerMessages.length} speaking turns. Keep building longer connected sentences using B1 connectors and verb-final word order.`,
    keyCorrections:
      inlineCorrections.length > 0
        ? inlineCorrections.slice(0, 3)
        : [
            {
              original: learnerMessages[0]?.textDe || "Ich denke das ist gut.",
              corrected: "Ich finde es gut, weil wir damit viel Zeit sparen.",
              explanation:
                "Adding a 'weil' reason clause immediately elevates A2 speech to B1.",
              bottleneckTag: "Nebensatz word order",
            },
          ],
    newBottlenecks:
      inlineCorrections.length > 0
        ? [
            {
              title:
                inlineCorrections[0].bottleneckTag ||
                "Connected B1 clauses under speaking pressure",
              category: "grammar",
              description: inlineCorrections[0].explanation,
              exampleMistake: inlineCorrections[0].original,
              betterGerman: inlineCorrections[0].corrected,
              severity: "medium",
            },
          ]
        : [],
    improvedBottlenecks: [],
    newVocabulary: module.keyVocabulary.slice(0, 3).map((phrase) => ({
      german: phrase,
      meaning: `Key expression for ${module.title}`,
      exampleDe: `${phrase} — nützlich für ${module.titleDe}.`,
    })),
    nextStepRecommendation:
      "Review your saved phrases aloud once, then continue to the next module in your study plan.",
  };

  if (db.aiConfig.provider === "demo" || learnerMessages.length === 0) {
    return fallbackDebrief;
  }

  const transcript = session.messages
    .map((m) => `${m.role === "coach" ? "COACH" : "LEARNER"}: ${m.textDe}`)
    .join("\n");

  const existingBottlenecks = db.memory.bottlenecks
    .filter((b) => b.severity !== "mastered")
    .map((b) => `- ${b.title}`)
    .join("\n");

  const prompt = `Evaluate this completed German speaking coaching session and update the learner's persistent memory.
- Learner: ${db.profile.name} (${db.profile.currentLevel} -> ${db.profile.targetLevel}, Goal: ${db.profile.goalTitle})
- Support Language: ${db.profile.nativeLanguage}
- Module: ${module.title} (${module.titleDe})
- Known Bottlenecks Before Session:
${existingBottlenecks || "None"}

FULL TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "scores": {
    "fluency": 0-100,
    "grammar": 0-100,
    "vocabulary": 0-100,
    "taskCompletion": 0-100
  },
  "praise": "Specific encouragement in ${db.profile.nativeLanguage}",
  "summary": "2-sentence progress summary for memory",
  "keyCorrections": [
    {
      "original": "exact learner sentence",
      "corrected": "natural German correction",
      "explanation": "short clear reason in ${db.profile.nativeLanguage}",
      "bottleneckTag": "short pattern name"
    }
  ],
  "newBottlenecks": [
    {
      "title": "Short recurring weakness name",
      "category": "grammar | vocabulary | fluency | pronunciation | exam_strategy",
      "description": "What the bottleneck is and how to fix it",
      "exampleMistake": "learner mistake from transcript",
      "betterGerman": "correct German version",
      "severity": "high | medium"
    }
  ],
  "improvedBottlenecks": ["Exact title of any known bottleneck the learner handled well today"],
  "newVocabulary": [
    {
      "german": "Useful German word or Redemittel from this topic",
      "meaning": "Meaning in ${db.profile.nativeLanguage}",
      "exampleDe": "Natural German example sentence"
    }
  ],
  "nextStepRecommendation": "Concrete next practice action in ${db.profile.nativeLanguage}"
}
Include 1-3 keyCorrections, 0-2 highest-leverage newBottlenecks, and 2-4 useful newVocabulary items.`;

  try {
    const result = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content:
            "You are a German CEFR/Goethe speaking examiner producing accurate, constructive JSON evaluations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<SessionDebrief>>(result.text);
    if (!parsed || typeof parsed.overallScore !== "number") {
      return fallbackDebrief;
    }

    return {
      overallScore: Math.max(0, Math.min(100, Math.round(parsed.overallScore))),
      scores: {
        fluency: Math.max(0, Math.min(100, Math.round(parsed.scores?.fluency ?? 75))),
        grammar: Math.max(0, Math.min(100, Math.round(parsed.scores?.grammar ?? 72))),
        vocabulary: Math.max(
          0,
          Math.min(100, Math.round(parsed.scores?.vocabulary ?? 75))
        ),
        taskCompletion: Math.max(
          0,
          Math.min(100, Math.round(parsed.scores?.taskCompletion ?? 80))
        ),
      },
      praise: parsed.praise || fallbackDebrief.praise,
      summary: parsed.summary || fallbackDebrief.summary,
      keyCorrections: Array.isArray(parsed.keyCorrections)
        ? parsed.keyCorrections.slice(0, 4)
        : fallbackDebrief.keyCorrections,
      newBottlenecks: Array.isArray(parsed.newBottlenecks)
        ? parsed.newBottlenecks.slice(0, 2)
        : [],
      improvedBottlenecks: Array.isArray(parsed.improvedBottlenecks)
        ? parsed.improvedBottlenecks
        : [],
      newVocabulary: Array.isArray(parsed.newVocabulary)
        ? parsed.newVocabulary.slice(0, 4)
        : fallbackDebrief.newVocabulary,
      nextStepRecommendation:
        parsed.nextStepRecommendation || fallbackDebrief.nextStepRecommendation,
    };
  } catch (err) {
    console.error("Session debrief fallback:", err);
    return fallbackDebrief;
  }
}

export function createCoachMessage(
  output: CoachTurnOutput,
  phaseOverride?: SessionPhase
): SessionMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: "coach",
    textDe: output.coachTextDe,
    translation: output.translation,
    phase: phaseOverride ?? output.nextPhase,
    timestamp: new Date().toISOString(),
    hints: output.hints,
    coachNote: output.coachNote,
  };
}
