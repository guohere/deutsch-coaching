import {
  AlternativeSaying,
  BottleneckCategory,
  DatabaseSchema,
  FreeChatRecord,
  TurnCorrection,
} from "../types";
import { extractJsonObject, generateWithAi } from "./providers";

export interface FreeChatTheme {
  id: string;
  title: string;
  titleDe: string;
  description: string;
}

export const FREE_CHAT_THEMES: FreeChatTheme[] = [
  {
    id: "everyday-free",
    title: "Free Everyday Talk",
    titleDe: "Freier Alltag & Small Talk",
    description:
      "Chat openly about your day, plans, hobbies, or anything on your mind in German.",
  },
  {
    id: "weak-spot-mixer",
    title: "My Weak-Spots & Memory Mixer",
    titleDe: "Gezielter Mix: Meine Schwachstellen",
    description:
      "Coach leads a relaxed chat specifically weaving in your memory bottlenecks and recent exercises.",
  },
  {
    id: "life-germany",
    title: "Life in Germany",
    titleDe: "Leben & Alltag in Deutschland",
    description:
      "Apartments, neighbors, culture shocks, doctors, transport, and everyday German habits.",
  },
  {
    id: "work-career",
    title: "Work, Career & Tech",
    titleDe: "Arbeit, Karriere & Bewerbung",
    description:
      "Workplace conversations, remote work, interviews, team communication, and career goals.",
  },
  {
    id: "opinions-debates",
    title: "Opinions & Hot Topics",
    titleDe: "Meinungen, Medien & Gesellschaft",
    description:
      "Practice expressing pros/cons and opinions naturally on AI, social media, climate, or lifestyle.",
  },
  {
    id: "travel-stories",
    title: "Travel & Stories",
    titleDe: "Reisen, Erlebnisse & Kultur",
    description:
      "Tell stories in Perfekt/Präteritum about trips, favorite cities, food, and memorable moments.",
  },
  {
    id: "cafe-friends",
    title: "Coffee with a German Friend",
    titleDe: "Kaffeepause mit Freunden",
    description:
      "Casual, idiomatic everyday German phrasing — learn how Germans really talk with friends.",
  },
];

export function buildMemoryContextDigest(db: DatabaseSchema): {
  promptBlock: string;
  activeBottleneckTitles: string[];
  recentExerciseTitles: string[];
  recentVocabWords: string[];
} {
  const activeBottlenecks = db.memory.bottlenecks
    .filter((b) => b.severity !== "mastered")
    .slice(0, 5);

  const recentSpeaking = db.sessions
    .filter((s) => Boolean(s.completedAt))
    .slice(0, 3)
    .map(
      (s) =>
        `Speaking: "${s.moduleTitle}" (Score ${s.debrief?.overallScore ?? "?"}/100)`
    );

  const recentDrills = (db.drillHistory ?? [])
    .slice(0, 4)
    .map(
      (d) =>
        `${d.skill.toUpperCase()}: "${d.exercise.title}" [${d.exercise.topicDe}] (Score ${d.grade.score}%)`
    );

  const recentExercises = [...recentSpeaking, ...recentDrills];
  const recentVocab = db.memory.vocabulary.slice(0, 8);

  const weakestGrammars = [...db.mastery.grammarStandards]
    .sort((a, b) => a.masteryPct - b.masteryPct)
    .slice(0, 3)
    .map((g) => `${g.titleDe} (${g.masteryPct}%)`);

  const promptBlock = `LEARNER MEMORY & EXERCISE HISTORY (Use subtly and naturally — never sound robotic!):
- Active Weak Points / Bottlenecks:
${
  activeBottlenecks.length > 0
    ? activeBottlenecks
        .map(
          (b) =>
            `  * [${b.severity.toUpperCase()}] ${b.title} (Habit: "${b.exampleMistake}" -> Better: "${b.betterGerman}")`
        )
        .join("\n")
    : "  * None recorded yet."
}
- Weakest Official Grammar Standards: ${weakestGrammars.join(", ") || "General B1"}
- Recent Exercises & Tests Completed:
${
  recentExercises.length > 0
    ? recentExercises.map((e) => `  * ${e}`).join("\n")
    : "  * No completed exercises yet."
}
- Saved German Vocabulary/Redemittel (encourage reusing when natural): ${
    recentVocab.map((v) => v.german).join(", ") || "None yet"
  }`;

  return {
    promptBlock,
    activeBottleneckTitles: activeBottlenecks.map((b) => b.title),
    recentExerciseTitles: recentExercises,
    recentVocabWords: recentVocab.map((v) => v.german),
  };
}

export interface FreeChatTurnOutput {
  coachTextDe: string;
  translation: string;
  correction: TurnCorrection | null;
  alternatives: AlternativeSaying[];
  hints: string[];
  memoryBridgeNote?: string;
}

export async function generateFreeChatOpening(
  db: DatabaseSchema,
  themeTitle: string,
  themeTitleDe: string
): Promise<FreeChatTurnOutput> {
  const digest = buildMemoryContextDigest(db);
  const topWeakness = digest.activeBottleneckTitles[0];

  const fallback: FreeChatTurnOutput = {
    coachTextDe: `Hallo ${db.profile.name}! Schön, dass wir heute frei auf Deutsch plaudern können. Unser Thema ist „${themeTitleDe}“. Erzähl mir einfach mal: Was fällt dir als Erstes dazu ein, oder wie war dein Tag bisher?`,
    translation: `Hi ${db.profile.name}! Great to chat freely in German today. Our theme is "${themeTitle}". Tell me: what comes to mind first, or how has your day been so far?`,
    correction: null,
    alternatives: [],
    hints: [
      "Heute war mein Tag ziemlich gut, weil...",
      "Bei diesem Thema denke ich zuerst an...",
      "Ich möchte heute besonders üben, über ... zu sprechen.",
    ],
    memoryBridgeNote: topWeakness
      ? `Keeping an eye on your memory focus: ${topWeakness}`
      : "Open German conversation calibrated to your level.",
  };

  if (db.aiConfig.provider === "demo") {
    return fallback;
  }

  try {
    const res = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are SprachCoach in FREE CHAT MODE — a warm, curious, human-like German conversation partner (not an exam robot).
Learner: ${db.profile.name} | Level: ${db.profile.currentLevel} -> ${db.profile.targetLevel} (${db.profile.goalTitle}) | Support Language: ${db.profile.nativeLanguage}

${digest.promptBlock}

THEME SELECTED: ${themeTitle} (${themeTitleDe})

TASK: Open a friendly, natural spoken German conversation on this theme (2–3 short spoken sentences max for TTS!).
HUMAN VOICE-AGENT STYLE:
- Write "coachTextDe" for the ear, not like an essay: use warm spoken German starters ("Ach, hallo!", "Schön, dass wir heute ein bisschen quatschen!", "Sag mal,", "Ehrlich gesagt...") and natural modal particles ("eigentlich", "mal", "ja", "doch").
- Never use slashes, abbreviations ("z.B."), or stiff textbook phrasing. Ask ONE inviting question that gets the learner talking right away.

Return ONLY valid JSON:
{
  "coachTextDe": "Natural spoken German opening (2-3 sentences)",
  "translation": "Translation in ${db.profile.nativeLanguage}",
  "hints": ["German starter 1", "German starter 2", "German starter 3"],
  "memoryBridgeNote": "1 short line in ${db.profile.nativeLanguage} noting which weak spot or recent topic you'll weave into this chat"
}`,
        },
        { role: "user", content: "Start our German free chat now." },
      ],
      temperature: 0.75,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<FreeChatTurnOutput>>(res.text);
    if (!parsed?.coachTextDe) return fallback;

    return {
      coachTextDe: parsed.coachTextDe,
      translation: parsed.translation || "",
      correction: null,
      alternatives: [],
      hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : fallback.hints,
      memoryBridgeNote: parsed.memoryBridgeNote || fallback.memoryBridgeNote,
    };
  } catch (err) {
    console.error("Free chat opening fallback:", err);
    return fallback;
  }
}

export async function generateThemePivot(
  db: DatabaseSchema,
  chat: FreeChatRecord,
  newThemeTitle: string,
  newThemeTitleDe: string
): Promise<FreeChatTurnOutput> {
  const fallback: FreeChatTurnOutput = {
    coachTextDe: `Gute Idee, wechseln wir gern das Thema zu „${newThemeTitleDe}“! Was sind deine Erfahrungen oder Gedanken dazu?`,
    translation: `Good idea, let's switch the theme to "${newThemeTitle}"! What are your experiences or thoughts on it?`,
    correction: null,
    alternatives: [],
    hints: [
      "Ich finde dieses Thema spannend, weil...",
      "Aus meiner Erfahrung kann ich sagen, dass...",
      "Ich frage mich oft, ob...",
    ],
    memoryBridgeNote: `Pivoted conversation theme to ${newThemeTitleDe}.`,
  };

  if (db.aiConfig.provider === "demo") return fallback;

  const digest = buildMemoryContextDigest(db);
  const recent = chat.messages.slice(-6).map((m) => ({
    role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user",
    content: m.textDe,
  }));

  try {
    const res = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are SprachCoach in FREE CHAT MODE. The learner just switched the conversation theme to: "${newThemeTitle}" (${newThemeTitleDe}).
Level: ${db.profile.currentLevel} -> ${db.profile.targetLevel} | Support language: ${db.profile.nativeLanguage}
${digest.promptBlock}

Smoothly transition into the new theme in 2–3 natural spoken German sentences and ask an engaging open question.
Return ONLY valid JSON:
{
  "coachTextDe": "Natural German pivot + question",
  "translation": "Translation in ${db.profile.nativeLanguage}",
  "hints": ["German starter 1", "German starter 2", "German starter 3"],
  "memoryBridgeNote": "Brief note in ${db.profile.nativeLanguage}"
}`,
        },
        ...recent,
        {
          role: "user",
          content: `[Learner switched conversation theme to: ${newThemeTitleDe}]`,
        },
      ],
      temperature: 0.75,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<FreeChatTurnOutput>>(res.text);
    if (!parsed?.coachTextDe) return fallback;
    return {
      coachTextDe: parsed.coachTextDe,
      translation: parsed.translation || "",
      correction: null,
      alternatives: [],
      hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : fallback.hints,
      memoryBridgeNote:
        parsed.memoryBridgeNote || `Switched theme to ${newThemeTitleDe}`,
    };
  } catch {
    return fallback;
  }
}

export async function generateFreeChatReply(
  db: DatabaseSchema,
  chat: FreeChatRecord,
  learnerTextDe: string
): Promise<FreeChatTurnOutput> {
  const digest = buildMemoryContextDigest(db);

  const fallback: FreeChatTurnOutput = {
    coachTextDe: `Das ist ein wirklich interessanter Punkt! Erzähl mir gern noch ein bisschen mehr darüber — warum findest du das so wichtig, oder wie machst du das normalerweise im Alltag?`,
    translation: `That's a really interesting point! Tell me a bit more about it — why do you find that important, or how do you normally handle it in everyday life?`,
    correction: null,
    alternatives: [
      {
        style: "everyday",
        label: "Casual / Everyday",
        german: `Ehrlich gesagt: ${learnerTextDe}`,
        nuance: "Relaxed conversational starter Germans use with friends.",
      },
      {
        style: "exam_ready",
        label: "Polished B1/B2",
        german: `Meiner Meinung nach ist das wichtig, weil es unseren Alltag stark beeinflusst.`,
        nuance: "Adds a 'weil' subordinate clause for stronger B1/B2 fluency.",
      },
    ],
    hints: [
      "Mir ist das wichtig, weil...",
      "Normalerweise mache ich es so, dass...",
      "Auf der anderen Seite muss man auch bedenken...",
    ],
    memoryBridgeNote:
      digest.activeBottleneckTitles[0]
        ? `Watching for: ${digest.activeBottleneckTitles[0]}`
        : undefined,
  };

  if (db.aiConfig.provider === "demo") {
    return fallback;
  }

  const history = chat.messages.slice(-12).map((m) => ({
    role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user",
    content: m.textDe,
  }));

  try {
    const res = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content: `You are SprachCoach in FREE CHAT MODE — a friendly, engaging German speaking companion who guides the learner to talk more and sound more natural.

LEARNER PROFILE:
- Name: ${db.profile.name}
- Level: ${db.profile.currentLevel} -> ${db.profile.targetLevel} (${db.profile.goalTitle})
- Support language (explanations, translations, nuances): ${db.profile.nativeLanguage}
- Active Conversation Theme: ${chat.themeTitle} (${chat.themeTitleDe})

${digest.promptBlock}

YOUR JOB ON THIS TURN:
1. "coachTextDe": React like a real German friend/coach in authentic spoken German (2–3 short, natural spoken sentences — will be read aloud via TTS!).
   - Always begin with a genuine spoken backchannel reaction ("Ach echt?", "Ja, total, das kenne ich auch!", "Stimmt, da hast du recht!", "Na klar,", "Ehrlich gesagt finde ich das auch spannend.").
   - Use natural German modal particles ("eigentlich", "doch", "mal", "ja", "halt") and shorter sentences so TTS prosody sounds 100% human.
   - Never use written abbreviations ("z.B.", "bzw."), slashes ("Freund/in"), or long nested clauses. End with ONE natural follow-up question.
2. "correction": If the learner made a meaningful grammar, word-order, case, or vocabulary mistake, provide a gentle, crisp correction. If their German was already grammatically clean, set "correction" to null.
3. "alternatives": ALWAYS provide 2–3 genuinely useful **Alternative Sayings** in German for expressing what the learner just tried to say:
   - One "everyday" (casual/idiomatic way native German speakers say it with friends)
   - One "natural_upgrade" (smooth, natural everyday German)
   - One "exam_ready" (polished ${db.profile.targetLevel} phrasing using a connector or Konjunktiv II)
4. "hints": 2–3 short German starter phrases for answering your follow-up question if the learner pauses.
5. "memoryBridgeNote": Optional 1-line note in ${db.profile.nativeLanguage} if you targeted a specific memory weak point or referenced a past exercise.

Return ONLY valid JSON:
{
  "coachTextDe": "Spoken German reply (2-4 sentences)",
  "translation": "Natural translation in ${db.profile.nativeLanguage}",
  "correction": {
    "original": "learner phrase",
    "corrected": "grammatically correct German",
    "explanation": "brief clear explanation in ${db.profile.nativeLanguage}",
    "bottleneckTag": "short skill tag"
  } | null,
  "alternatives": [
    {
      "style": "everyday | natural_upgrade | exam_ready",
      "label": "e.g. Casual / Everyday",
      "german": "Alternative natural German sentence",
      "nuance": "Short note in ${db.profile.nativeLanguage} on tone or why it sounds natural"
    }
  ],
  "hints": ["German starter 1", "German starter 2"],
  "memoryBridgeNote": "Optional brief note or empty string"
}`,
        },
        ...history,
        { role: "user", content: learnerTextDe },
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<FreeChatTurnOutput>>(res.text);
    if (!parsed?.coachTextDe) return fallback;

    return {
      coachTextDe: parsed.coachTextDe,
      translation: parsed.translation || "",
      correction: parsed.correction?.corrected ? parsed.correction : null,
      alternatives: Array.isArray(parsed.alternatives)
        ? parsed.alternatives.slice(0, 3)
        : fallback.alternatives,
      hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : fallback.hints,
      memoryBridgeNote: parsed.memoryBridgeNote?.trim() || undefined,
    };
  } catch (err) {
    console.error("Free chat turn fallback:", err);
    return fallback;
  }
}

export interface FreeChatMemorySummary {
  score: number;
  summary: string;
  praise: string;
  newBottlenecks: Array<{
    title: string;
    category: BottleneckCategory;
    description: string;
    exampleMistake: string;
    betterGerman: string;
    severity: "high" | "medium";
  }>;
  improvedBottlenecks: string[];
  newVocabulary: Array<{
    german: string;
    meaning: string;
    exampleDe: string;
  }>;
}

export async function extractFreeChatInsights(
  db: DatabaseSchema,
  chat: FreeChatRecord
): Promise<FreeChatMemorySummary> {
  const learnerMsgs = chat.messages.filter((m) => m.role === "learner");
  const corrections = learnerMsgs
    .map((m) => m.correction)
    .filter((c): c is TurnCorrection => Boolean(c));

  const fallback: FreeChatMemorySummary = {
    score: Math.min(90, 68 + learnerMsgs.length * 3),
    praise: `Great free German conversation on "${chat.themeTitleDe}" across ${learnerMsgs.length} spoken turns!`,
    summary: `Practiced spontaneous German speaking on "${chat.themeTitleDe}". Kept conversation flowing and practiced alternative native expressions.`,
    newBottlenecks:
      corrections.length > 0
        ? [
            {
              title: corrections[0].bottleneckTag || "Spontaneous sentence structure",
              category: "grammar",
              description: corrections[0].explanation,
              exampleMistake: corrections[0].original,
              betterGerman: corrections[0].corrected,
              severity: "medium",
            },
          ]
        : [],
    improvedBottlenecks: [],
    newVocabulary: learnerMsgs
      .flatMap((m) => m.alternatives ?? [])
      .slice(0, 3)
      .map((alt) => ({
        german: alt.german,
        meaning: alt.nuance,
        exampleDe: alt.german,
      })),
  };

  if (db.aiConfig.provider === "demo" || learnerMsgs.length === 0) {
    return fallback;
  }

  const transcript = chat.messages
    .map((m) => `${m.role === "coach" ? "COACH" : "LEARNER"}: ${m.textDe}`)
    .join("\n");

  const knownBn = db.memory.bottlenecks
    .filter((b) => b.severity !== "mastered")
    .map((b) => `- ${b.title}`)
    .join("\n");

  try {
    const res = await generateWithAi(db.aiConfig, {
      messages: [
        {
          role: "system",
          content:
            "Extract concise learning insights from a German free-chat conversation to update the learner's memory. Output ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Analyze this German Free Chat on "${chat.themeTitleDe}" (${db.profile.currentLevel}->${db.profile.targetLevel}, explanations in ${db.profile.nativeLanguage}).
Known Bottlenecks:
${knownBn || "None"}

TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "score": 0-100,
  "praise": "Specific encouragement",
  "summary": "1-2 sentence summary for memory",
  "newBottlenecks": [
    {
      "title": "Short recurring weakness",
      "category": "grammar | vocabulary | fluency | pronunciation | exam_strategy",
      "description": "What to improve",
      "exampleMistake": "learner mistake",
      "betterGerman": "correct German",
      "severity": "high | medium"
    }
  ],
  "improvedBottlenecks": ["Exact title of known bottleneck handled well"],
  "newVocabulary": [
    {"german": "Useful German phrase from chat", "meaning": "meaning", "exampleDe": "German example"}
  ]
}`,
        },
      ],
      temperature: 0.35,
      jsonMode: true,
    });

    const parsed = extractJsonObject<Partial<FreeChatMemorySummary>>(res.text);
    if (!parsed || typeof parsed.score !== "number") return fallback;

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      praise: parsed.praise || fallback.praise,
      summary: parsed.summary || fallback.summary,
      newBottlenecks: Array.isArray(parsed.newBottlenecks)
        ? parsed.newBottlenecks.slice(0, 2)
        : [],
      improvedBottlenecks: Array.isArray(parsed.improvedBottlenecks)
        ? parsed.improvedBottlenecks
        : [],
      newVocabulary: Array.isArray(parsed.newVocabulary)
        ? parsed.newVocabulary.slice(0, 4)
        : fallback.newVocabulary,
    };
  } catch {
    return fallback;
  }
}
