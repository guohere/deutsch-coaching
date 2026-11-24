import {
  GOETHE_B1_BLUEPRINT,
  getExerciseTargetSeconds,
} from "./goethe-exam-specs";
import {
  CefrLevel,
  DrillAttemptRecord,
  ExamSkill,
  GrammarStandardProgress,
  LearnerMemory,
  LearnerProfile,
  MasteryTracker,
  SessionRecord,
  SkillTeilCoverage,
  VocabCategoryProgress,
} from "./types";

export const NEXT_HORIZON_TRACKS = [
  {
    id: "next-b2",
    title: "Level Up: Goethe-Zertifikat B2",
    badge: "Next CEFR Level",
    targetLevel: "B2" as CefrLevel,
    goalTitle: "Goethe-Zertifikat B2 Exam",
    goalDetails:
      "Master B2 structured presentations, pro/contra debates, formal writing, and nuanced listening.",
    description:
      "Ready to push beyond B1? Move into formal argumentation, workplace debates, Passiv, and Genitiv structures.",
  },
  {
    id: "business-german",
    title: "Business & Workplace German (Beruf)",
    badge: "Career Track",
    targetLevel: "B2" as CefrLevel,
    goalTitle: "Business & Workplace German",
    goalDetails:
      "Communicate confidently in German standups, client calls, job interviews, salary negotiations, and professional emails.",
    description:
      "Practice realistic job interviews, team standups, stakeholder feedback, and formal German workplace etiquette.",
  },
  {
    id: "life-germany",
    title: "Real Life in Germany (Alltag & Behörden)",
    badge: "Life Mastery",
    targetLevel: "B1" as CefrLevel,
    goalTitle: "Confident Daily Life in Germany",
    goalDetails:
      "Handle apartment hunting, Bürgeramt/Ausländerbehörde appointments, doctors, banking, contracts, and local small talk effortlessly.",
    description:
      "Master high-stakes real-world German situations like Mietvertrag questions, doctor visits, and phone calls.",
  },
];

function getB1VocabCategories(): VocabCategoryProgress[] {
  return [
    {
      id: "voc-work",
      titleDe: "Arbeit, Beruf & Bewerbung",
      titleEn: "Work, Career & Applications",
      targetWords: 300,
      masteredWords: 45,
      sampleWords: [
        "die Bewerbung",
        "der Arbeitsplatz",
        "das Gehalt",
        "die Berufserfahrung",
        "kündigen",
        "die Überstunden",
      ],
      progressPct: 15,
    },
    {
      id: "voc-living",
      titleDe: "Wohnen, Alltag & Nachbarschaft",
      titleEn: "Housing, Daily Life & Neighbors",
      targetWords: 300,
      masteredWords: 60,
      sampleWords: [
        "die Miete",
        "der Mietvertrag",
        "umziehen",
        "die Nebenkosten",
        "der Vermieter",
        "die Nachbarschaft",
      ],
      progressPct: 20,
    },
    {
      id: "voc-health",
      titleDe: "Gesundheit, Ernährung & Sport",
      titleEn: "Health, Nutrition & Fitness",
      targetWords: 280,
      masteredWords: 48,
      sampleWords: [
        "die Ernährung",
        "die Krankschreibung",
        "das Rezept",
        "sich bewegen",
        "die Beschwerden",
        "gesund leben",
      ],
      progressPct: 17,
    },
    {
      id: "voc-travel",
      titleDe: "Reisen, Verkehr & Mobilität",
      titleEn: "Travel, Transport & Mobility",
      targetWords: 280,
      masteredWords: 55,
      sampleWords: [
        "die Verspätung",
        "der Anschlusszug",
        "die Unterkunft",
        "buchen",
        "der Nahverkehr",
        "der Führerschein",
      ],
      progressPct: 20,
    },
    {
      id: "voc-environment",
      titleDe: "Umwelt, Natur & Konsum",
      titleEn: "Environment, Climate & Shopping",
      targetWords: 300,
      masteredWords: 32,
      sampleWords: [
        "der Umweltschutz",
        "Müll trennen",
        "Strom sparen",
        "nachhaltig",
        "die Verpackung",
        "umtauschen",
      ],
      progressPct: 11,
    },
    {
      id: "voc-media",
      titleDe: "Medien, Digitales & Kommunikation",
      titleEn: "Media, Internet & Communication",
      targetWords: 280,
      masteredWords: 40,
      sampleWords: [
        "soziale Netzwerke",
        "herunterladen",
        "der Datenschutz",
        "erreichen",
        "die Nachricht",
        "sich informieren",
      ],
      progressPct: 14,
    },
    {
      id: "voc-leisure",
      titleDe: "Freizeit, Kultur & Feste",
      titleEn: "Free Time, Culture & Celebrations",
      targetWords: 320,
      masteredWords: 64,
      sampleWords: [
        "die Veranstaltung",
        "einladen",
        "der Ausflug",
        "die Ausstellung",
        "organisieren",
        "sich freuen auf",
      ],
      progressPct: 20,
    },
    {
      id: "voc-education",
      titleDe: "Bildung, Lernen & Gesellschaft",
      titleEn: "Education, Learning & Society",
      targetWords: 340,
      masteredWords: 50,
      sampleWords: [
        "die Ausbildung",
        "die Prüfung bestehen",
        "das Zeugnis",
        "die Meinung",
        "die Erfahrung",
        "unterstützen",
      ],
      progressPct: 15,
    },
    {
      id: "voc-banking",
      titleDe: "Bank, Geld & Finanzen",
      titleEn: "Banking, Accounts & Transfers",
      targetWords: 260,
      masteredWords: 0,
      sampleWords: [
        "das Girokonto",
        "überweisen",
        "der Dauerauftrag",
        "die Kontoführungsgebühr",
        "Geld abheben",
        "der Kontoauszug",
      ],
      progressPct: 0,
    },
    {
      id: "voc-food",
      titleDe: "Essen, Trinken & Restaurant",
      titleEn: "Food, Dining & Restaurants",
      targetWords: 280,
      masteredWords: 0,
      sampleWords: [
        "die Speisekarte",
        "bestellen",
        "das Trinkgeld",
        "getrennt bezahlen",
        "die Reservierung",
        "die Beilage",
      ],
      progressPct: 0,
    },
    {
      id: "voc-jobsearch",
      titleDe: "Jobsuche, Bewerbung & KI-Karriere",
      titleEn: "Job Search, Applications & AI Career",
      targetWords: 260,
      masteredWords: 0,
      sampleWords: [
        "der Lebenslauf",
        "das Anschreiben",
        "der Berufseinsteiger",
        "die Stellenanzeige",
        "die Probezeit",
        "die Rückmeldung",
      ],
      progressPct: 0,
    },
  ];
}

function getB1GrammarStandards(): GrammarStandardProgress[] {
  return [
    {
      id: "gram-nebensatz",
      title: "Subordinate Clauses & Verb-Final Order",
      titleDe: "Nebensätze (weil, dass, obwohl, wenn, damit)",
      description:
        "Sending the conjugated verb reliably to the end in spoken & written clauses.",
      exampleDe: "Ich lerne jeden Tag, weil ich die B1-Prüfung bestehen möchte.",
      masteryPct: 20,
      practiceCount: 0,
    },
    {
      id: "gram-konjunktiv2",
      title: "Konjunktiv II (Polite Proposals & Wishes)",
      titleDe: "Konjunktiv II (könnte, würde, hätte, wäre)",
      description:
        "Essential for Goethe B1 Teil 1 planning, polite requests, and hypotheticals.",
      exampleDe: "Wir könnten am Samstag zusammen einkaufen gehen. Wäre das gut?",
      masteryPct: 18,
      practiceCount: 0,
    },
    {
      id: "gram-relativsatz",
      title: "Relative Clauses",
      titleDe: "Relativsätze (der, die, das, in dem, mit denen)",
      description:
        "Describing people, places, and things smoothly without chopping sentences.",
      exampleDe: "Das ist das Café, in dem wir uns letzte Woche getroffen haben.",
      masteryPct: 15,
      practiceCount: 0,
    },
    {
      id: "gram-past",
      title: "Perfekt & Präteritum Storytelling",
      titleDe: "Vergangenheit (Perfekt & Präteritum)",
      description:
        "Narrating personal experiences naturally using haben/sein + war/hatte/konnte.",
      exampleDe: "Letztes Jahr war ich in München und habe dort viele Freunde besucht.",
      masteryPct: 28,
      practiceCount: 0,
    },
    {
      id: "gram-passiv",
      title: "Passive Voice (Present & Past)",
      titleDe: "Passiv (Präsens & Präteritum)",
      description:
        "Understanding and expressing processes, rules, and news headlines.",
      exampleDe: "In Deutschland wird der Müll sehr genau getrennt.",
      masteryPct: 12,
      practiceCount: 0,
    },
    {
      id: "gram-prepositions",
      title: "Verbs with Prepositions & Cases",
      titleDe: "Verben mit Präpositionen & Wechselpräpositionen",
      description:
        "Handling Dativ vs. Akkusativ and core B1 verbs (sich interessieren für, denken an, warten auf).",
      exampleDe: "Ich interessiere mich sehr für erneuerbare Energien.",
      masteryPct: 18,
      practiceCount: 0,
    },
    {
      id: "gram-infinitiv-zu",
      title: "Infinitive Clauses (zu / um ... zu)",
      titleDe: "Infinitiv mit „zu“ & „um ... zu“",
      description:
        "Expressing purpose, plans, and opinions cleanly at B1 level.",
      exampleDe: "Es ist wichtig, regelmäßig Deutsch zu sprechen, um sicherer zu werden.",
      masteryPct: 16,
      practiceCount: 0,
    },
    {
      id: "gram-adjectives",
      title: "Adjective Endings & Comparisons",
      titleDe: "Adjektivdeklination & Komparativ/Superlativ",
      description:
        "Comparing options (City vs. Countryside, Homeoffice vs. Office) accurately.",
      exampleDe: "Das Leben auf dem Land ist ruhiger als in einer großen Stadt.",
      masteryPct: 22,
      practiceCount: 0,
    },
  ];
}

function getB2GrammarStandards(): GrammarStandardProgress[] {
  return [
    {
      id: "gram-b2-connectors",
      title: "Two-Part & Complex Connectors",
      titleDe: "Zweiteilige Konnektoren (einerseits... andererseits, je... desto)",
      description: "Structuring balanced B2 presentations and pro/contra arguments.",
      exampleDe: "Einerseits spart Homeoffice Zeit, andererseits fehlt der persönliche Austausch.",
      masteryPct: 20,
      practiceCount: 0,
    },
    {
      id: "gram-b2-passiv",
      title: "Passive & Passive Alternatives",
      titleDe: "Passiv & Passiversatzformen (sich lassen, -bar, sein + zu)",
      description: "Expressing formal and objective workplace/academic statements.",
      exampleDe: "Dieses Problem lässt sich nur gemeinsam lösen.",
      masteryPct: 18,
      practiceCount: 0,
    },
    {
      id: "gram-b2-genitiv",
      title: "Genitive Prepositions",
      titleDe: "Präpositionen mit Genitiv (trotz, aufgrund, während, statt)",
      description: "Connecting cause, contrast, and conditions concisely.",
      exampleDe: "Trotz hoher Kosten investieren viele Städte in den Nahverkehr.",
      masteryPct: 18,
      practiceCount: 0,
    },
    {
      id: "gram-b2-konjunktiv",
      title: "Konjunktiv II Past & Polite Disagreement",
      titleDe: "Konjunktiv II der Vergangenheit & höfliche Kritik",
      description: "Discussing missed alternatives and softening counterarguments.",
      exampleDe: "Man hätte das Projekt früher starten sollen.",
      masteryPct: 15,
      practiceCount: 0,
    },
    {
      id: "gram-b2-nominal",
      title: "Nominalization vs. Verbal Style",
      titleDe: "Nominalisierung im Vortrag & formellen Schreiben",
      description: "Switching naturally between spoken and formal written German.",
      exampleDe: "Nach der Einführung neuer Regeln stieg die Zufriedenheit.",
      masteryPct: 15,
      practiceCount: 0,
    },
    {
      id: "gram-b2-partizip",
      title: "Participle Attributes (Partizip I & II)",
      titleDe: "Partizipien als Adjektive",
      description: "Reading complex articles and speaking precisely.",
      exampleDe: "Die ständig steigenden Mieten sind ein großes Thema.",
      masteryPct: 14,
      practiceCount: 0,
    },
  ];
}

function getA2GrammarStandards(): GrammarStandardProgress[] {
  return [
    {
      id: "gram-a2-perfekt",
      title: "Perfekt with haben & sein",
      titleDe: "Perfekt im Alltag",
      description: "Talking clearly about what you did yesterday or last weekend.",
      exampleDe: "Am Wochenende bin ich nach Hamburg gefahren und habe Freunde besucht.",
      masteryPct: 22,
      practiceCount: 0,
    },
    {
      id: "gram-a2-modal",
      title: "Modal Verbs & Sentence Bracket",
      titleDe: "Modalverben (können, müssen, wollen, dürfen)",
      description: "Keeping the infinitive verb cleanly at the end of the sentence.",
      exampleDe: "Ich muss morgen früh zum Arzt gehen.",
      masteryPct: 25,
      practiceCount: 0,
    },
    {
      id: "gram-a2-weil",
      title: "Basic Subordinate Clauses (weil / dass / wenn)",
      titleDe: "Nebensätze mit weil, dass und wenn",
      description: "Giving simple reasons in everyday German.",
      exampleDe: "Ich komme später, weil mein Zug Verspätung hat.",
      masteryPct: 18,
      practiceCount: 0,
    },
    {
      id: "gram-a2-cases",
      title: "Akkusativ & Dativ Core Prepositions",
      titleDe: "Akkusativ & Dativ (mit, für, zu, bei, in)",
      description: "Using common prepositions reliably in daily conversations.",
      exampleDe: "Ich fahre jeden Morgen mit dem Bus zur Arbeit.",
      masteryPct: 20,
      practiceCount: 0,
    },
    {
      id: "gram-a2-separable",
      title: "Separable & Reflexive Verbs",
      titleDe: "Trennbare & reflexive Verben",
      description: "Handling everyday verbs like einkaufen, aufstehen, sich treffen.",
      exampleDe: "Wir treffen uns um 18 Uhr und kaufen zusammen ein.",
      masteryPct: 24,
      practiceCount: 0,
    },
  ];
}

export function createDefaultMastery(
  targetLevel: CefrLevel,
  examName: string
): MasteryTracker {
  const now = new Date().toISOString();
  const isB2 = targetLevel === "B2" || targetLevel === "C1";
  const isA2 = targetLevel === "A1" || targetLevel === "A2";

  return {
    standardLevel: targetLevel,
    examName: examName || `Goethe-Zertifikat ${targetLevel}`,
    updatedAt: now,
    skills: {
      sprechen: {
        skill: "sprechen",
        label: "Speaking",
        labelDe: "Sprechen",
        examParts: isB2
          ? "Teil 1: Vortrag · Teil 2: Diskussion"
          : isA2
          ? "Teil 1: Fragen · Teil 2: Erzählen · Teil 3: Planen"
          : "Teil 1: Planen · Teil 2: Präsentation · Teil 3: Rückmeldung",
        passThreshold: 60,
        score: 22,
        sessionsCount: 0,
      },
      hoeren: {
        skill: "hoeren",
        label: "Listening",
        labelDe: "Hören",
        examParts: isB2
          ? "Alltag, Radio-Interview, Gespräch, Vortrag"
          : isA2
          ? "Kurze Nachrichten, Durchsagen, Gespräche"
          : "Alltag, Durchsagen, Gespräche & Radiodiskussion",
        passThreshold: 60,
        score: 20,
        sessionsCount: 0,
      },
      lesen: {
        skill: "lesen",
        label: "Reading",
        labelDe: "Lesen",
        examParts: isB2
          ? "Meinungen, Fachartikel, Kommentare, Vorschriften"
          : isA2
          ? "Kurze Artikel, Anzeigen, E-Mails, Schilder"
          : "Blog/Artikel, Presse, Anzeigen, Leserbriefe & Regeln",
        passThreshold: 60,
        score: 24,
        sessionsCount: 0,
      },
      schreiben: {
        skill: "schreiben",
        label: "Writing",
        labelDe: "Schreiben",
        examParts: isB2
          ? "Teil 1: Forumsbeitrag · Teil 2: Formelle Nachricht"
          : isA2
          ? "Teil 1: SMS/Notiz · Teil 2: Formelle E-Mail"
          : "Teil 1: E-Mail · Teil 2: Meinung/Forum · Teil 3: Formelle Nachricht",
        passThreshold: 60,
        score: 18,
        sessionsCount: 0,
      },
    },
    vocabCategories: getB1VocabCategories(),
    grammarStandards: isB2
      ? getB2GrammarStandards()
      : isA2
      ? getA2GrammarStandards()
      : getB1GrammarStandards(),
    history: [],
  };
}

function inferDrillPartNum(
  attempt: DrillAttemptRecord,
  maxParts: number
): number {
  const explicit = attempt.exercise?.examPartNumber;
  if (explicit && explicit >= 1 && explicit <= maxParts) {
    return explicit;
  }
  const text = `${attempt.exercise?.examPartLabel ?? ""} ${
    attempt.exercise?.title ?? ""
  }`;
  const match = text.match(/(?:teil|aufgabe)\s*([1-5])/i);
  if (match?.[1]) {
    const parsed = Number(match[1]);
    if (parsed >= 1 && parsed <= maxParts) return parsed;
  }
  return 1;
}

function inferSpeakingPartNum(session: SessionRecord): number {
  const cat = session.moduleCategory;
  const title = (session.moduleTitle || "").toLowerCase();
  if (
    cat === "exam_teil2_presentation" ||
    title.includes("teil 2") ||
    title.includes("präsentation")
  ) {
    return 2;
  }
  if (
    cat === "exam_teil3_discussion" ||
    title.includes("teil 3") ||
    title.includes("rückmeldung")
  ) {
    return 3;
  }
  return 1;
}

function getDepthConfidence(uniqueTasksInTeil: number): number {
  if (uniqueTasksInTeil <= 0) return 0;
  if (uniqueTasksInTeil === 1) return 0.55; // 1 task tried in this Teil -> 55% confidence weight
  if (uniqueTasksInTeil === 2) return 0.8; // 2 unique tasks tried in this Teil -> 80% confidence weight
  return 1.0; // 3+ unique tasks tried in this Teil -> 100% confidence weight
}

/**
 * Recomputes all 4 exam skill scores directly from actual practice evidence:
 * - Deduplicates multiple retries on the same exercise so repeating 1 task 10 times
 *   doesn't inflate breadth.
 * - Requires covering ALL official Teile (Sprechen: 3, Hören: 4, Lesen: 5, Schreiben: 3);
 *   any untested Teil contributes 0% verified readiness until practiced.
 * - Weights each tested Teil by experience depth (1 task = 55%, 2 tasks = 80%, 3+ tasks = 100%).
 */
export function recalculateSkillsFromHistory(
  mastery: MasteryTracker,
  sessions: SessionRecord[],
  drillHistory: DrillAttemptRecord[]
): void {
  const partConfigs: Record<
    ExamSkill,
    { totalParts: number; partPrefix: string }
  > = {
    sprechen: { totalParts: 3, partPrefix: "Teil" },
    hoeren: { totalParts: 4, partPrefix: "Teil" },
    lesen: { totalParts: 5, partPrefix: "Teil" },
    schreiben: { totalParts: 3, partPrefix: "Aufgabe" },
  };

  for (const skill of ["sprechen", "hoeren", "lesen", "schreiben"] as const) {
    const cfg = partConfigs[skill];
    const skillObj = mastery.skills[skill];

    // Map: partNumber -> Map<uniqueTaskId, number[] (chronological scores: newest first)>
    const byPart = new Map<number, Map<string, number[]>>();
    for (let p = 1; p <= cfg.totalParts; p++) {
      byPart.set(p, new Map());
    }

    let totalAttemptsCount = 0;
    let latestTimestamp: string | undefined = skillObj.lastPracticedAt;

    if (skill === "sprechen") {
      const completedSessions = sessions.filter((s) => Boolean(s.debrief));
      for (const s of completedSessions) {
        totalAttemptsCount += 1;
        const pNum = inferSpeakingPartNum(s);
        const taskKey = s.moduleId || s.moduleTitle;
        const partMap = byPart.get(pNum)!;
        const list = partMap.get(taskKey) ?? [];
        list.push(s.debrief!.overallScore);
        partMap.set(taskKey, list);
        if (
          s.completedAt &&
          (!latestTimestamp || s.completedAt > latestTimestamp)
        ) {
          latestTimestamp = s.completedAt;
        }
      }
    } else {
      const skillDrills = drillHistory.filter((d) => d.skill === skill);

      // Filter out old timeout demo-fallback grades ("Good effort writing X words in German!")
      // if real AI-graded attempts exist for that exercise
      const hasRealAttemptForEx = new Set<string>();
      for (const d of skillDrills) {
        if (!d.grade.praise.startsWith("Good effort writing ")) {
          hasRealAttemptForEx.add(d.exerciseId);
        }
      }

      for (const d of skillDrills) {
        if (
          skill === "schreiben" &&
          d.grade.praise.startsWith("Good effort writing ") &&
          hasRealAttemptForEx.has(d.exerciseId)
        ) {
          continue;
        }
        totalAttemptsCount += 1;
        const pNum = inferDrillPartNum(d, cfg.totalParts);
        const taskKey = d.exerciseId || d.exercise.title;
        const partMap = byPart.get(pNum)!;
        const list = partMap.get(taskKey) ?? [];
        list.push(d.grade.score);
        partMap.set(taskKey, list);
        if (
          d.completedAt &&
          (!latestTimestamp || d.completedAt > latestTimestamp)
        ) {
          latestTimestamp = d.completedAt;
        }
      }
    }

    const teilBreakdown: SkillTeilCoverage[] = [];
    const allUniqueTaskScores: number[] = [];
    let testedPartsCount = 0;

    for (let p = 1; p <= cfg.totalParts; p++) {
      const partMap = byPart.get(p)!;
      const uniqueTaskScoresInPart: number[] = [];
      let attemptsInPart = 0;

      for (const scores of partMap.values()) {
        attemptsInPart += scores.length;
        const latest = scores[0]; // drillHistory & sessions are newest-first
        const avg =
          scores.reduce((sum, val) => sum + val, 0) /
          Math.max(1, scores.length);
        // Weight latest attempt 65% + historical average 35% so improvements count
        // without erasing earlier mistakes
        const effectiveTaskScore = Math.round(latest * 0.65 + avg * 0.35);
        uniqueTaskScoresInPart.push(effectiveTaskScore);
        allUniqueTaskScores.push(effectiveTaskScore);
      }

      const uniqueCount = uniqueTaskScoresInPart.length;
      if (uniqueCount > 0) {
        testedPartsCount += 1;
      }

      const partAvgScore =
        uniqueCount > 0
          ? Math.round(
              uniqueTaskScoresInPart.reduce((a, b) => a + b, 0) / uniqueCount
            )
          : null;

      const depthFactor = getDepthConfidence(uniqueCount);
      const readinessContribution =
        partAvgScore !== null ? Math.round(partAvgScore * depthFactor) : 0;

      teilBreakdown.push({
        partNumber: p,
        label: `${cfg.partPrefix} ${p}`,
        uniqueTasksCount: uniqueCount,
        attemptsCount: attemptsInPart,
        avgScore: partAvgScore,
        readinessContribution,
      });
    }

    const totalUniqueTasks = allUniqueTaskScores.length;
    const practicedAccuracyAvg =
      totalUniqueTasks > 0
        ? Math.round(
            allUniqueTaskScores.reduce((a, b) => a + b, 0) / totalUniqueTasks
          )
        : null;

    // Verified exam readiness is the average readiness contribution across ALL official Teile (including 0% for untested Teile!)
    const verifiedReadinessScore =
      totalUniqueTasks > 0
        ? Math.max(
            5,
            Math.min(
              99,
              Math.round(
                teilBreakdown.reduce(
                  (sum, tb) => sum + tb.readinessContribution,
                  0
                ) / cfg.totalParts
              )
            )
          )
        : 8;

    skillObj.score = verifiedReadinessScore;
    skillObj.practicedAccuracyAvg = practicedAccuracyAvg;
    skillObj.uniqueTasksCount = totalUniqueTasks;
    skillObj.totalPartsCount = cfg.totalParts;
    skillObj.testedPartsCount = testedPartsCount;
    skillObj.teilBreakdown = teilBreakdown;
    skillObj.sessionsCount = totalAttemptsCount;
    if (latestTimestamp) {
      skillObj.lastPracticedAt = latestTimestamp;
    }
  }
}

export interface ReadinessSummary {
  overallReadiness: number;
  skillsAvg: number;
  vocabAvg: number;
  topicBreadthPct: number;
  topicsTrainedCount: number;
  topicsStrongCount: number;
  totalTopicsCount: number;
  grammarAvg: number;
  skillsPassingCount: number;
  passProbabilityPct: number;
  testedTeileTotal: number;
  totalTeileCount: number;
  verdictTitle: string;
  verdictTone: "foundation" | "approaching" | "passing" | "high" | "ready";
  verdictDetail: string;
  estimatedCefrStanding: string;
  weakestSkill: ExamSkill;
  weakestVocab: VocabCategoryProgress;
  weakestGrammar: GrammarStandardProgress;
  readyForNextHorizon: boolean;
}

export function computeReadinessMetrics(
  mastery: MasteryTracker,
  memory: LearnerMemory,
  profile: LearnerProfile
): ReadinessSummary {
  const skillList = Object.values(mastery.skills);
  const skillsAvg = Math.round(
    skillList.reduce((acc, s) => acc + s.score, 0) / Math.max(1, skillList.length)
  );
  const skillsPassingCount = skillList.filter(
    (s) => s.score >= s.passThreshold
  ).length;

  const testedTeileTotal = skillList.reduce(
    (sum, s) => sum + (s.testedPartsCount ?? (s.sessionsCount > 0 ? 1 : 0)),
    0
  );
  const totalTeileCount = skillList.reduce(
    (sum, s) => sum + (s.totalPartsCount ?? 3),
    0
  );
  const teilCoverageRatio =
    totalTeileCount > 0 ? testedTeileTotal / totalTeileCount : 0;

  const vocabCats = mastery.vocabCategories;
  const totalTopicsCount = vocabCats.length;
  const vocabAvg = Math.round(
    vocabCats.reduce((acc, v) => acc + v.progressPct, 0) /
      Math.max(1, totalTopicsCount)
  );
  // Topic breadth: how many official exam topic categories are meaningfully trained (>= 40%) and strong (>= 60%)
  const topicsTrainedCount = vocabCats.filter((v) => v.progressPct >= 40).length;
  const topicsStrongCount = vocabCats.filter((v) => v.progressPct >= 60).length;
  const minTopicPct =
    vocabCats.length > 0
      ? Math.min(...vocabCats.map((v) => v.progressPct))
      : 0;
  const topicCoverageRatio =
    totalTopicsCount > 0 ? topicsTrainedCount / totalTopicsCount : 0;
  // Blend average vocab mastery (55%), breadth of trained topic categories (30%), and weakest-topic floor (15%)
  const topicBreadthPct = Math.round(
    vocabAvg * 0.55 + topicCoverageRatio * 100 * 0.3 + minTopicPct * 0.15
  );

  const rawGrammarAvg =
    mastery.grammarStandards.reduce((acc, g) => acc + g.masteryPct, 0) /
    Math.max(1, mastery.grammarStandards.length);
  const highBottlenecks = memory.bottlenecks.filter(
    (b) => b.severity === "high"
  ).length;
  const grammarAvg = Math.max(
    0,
    Math.min(100, Math.round(rawGrammarAvg - Math.min(8, highBottlenecks * 2)))
  );

  const overallReadiness = Math.max(
    0,
    Math.min(
      100,
      Math.round(skillsAvg * 0.5 + topicBreadthPct * 0.25 + grammarAvg * 0.25)
    )
  );

  // Calibrated pass chance accounting for BOTH exam Teile coverage AND Topic Category breadth!
  const minSkillScore = Math.min(...skillList.map((s) => s.score));
  const rawPassChance =
    overallReadiness * 0.62 +
    minSkillScore * 0.28 +
    topicBreadthPct * 0.1 +
    (skillsPassingCount === 4 ? 6 : 0);
  const teilFactor = 0.35 + 0.65 * teilCoverageRatio;
  const topicFactor = 0.68 + 0.32 * topicCoverageRatio;
  const coverageWeightedPassChance = Math.round(
    rawPassChance * teilFactor * topicFactor
  );
  const passProbabilityPct = Math.max(
    5,
    Math.min(98, coverageWeightedPassChance)
  );

  const weakestSkill = [...skillList].sort((a, b) => a.score - b.score)[0]
    .skill;
  const weakestVocab = [...vocabCats].sort(
    (a, b) => a.progressPct - b.progressPct
  )[0];
  const weakestGrammar = [...mastery.grammarStandards].sort(
    (a, b) => a.masteryPct - b.masteryPct
  )[0];

  let verdictTitle = "Building Core Foundation, Teile & Topic Coverage";
  let verdictTone: ReadinessSummary["verdictTone"] = "foundation";
  let verdictDetail = `You have tested ${testedTeileTotal}/${totalTeileCount} exam Teile and trained ${topicsTrainedCount}/${totalTopicsCount} official topic categories. Boost „${weakestVocab?.titleDe ?? "weakest topic"}“ (${weakestVocab?.progressPct ?? 0}%) and untested Teile to raise your pass chance.`;

  if (
    overallReadiness >= 78 &&
    skillsPassingCount === 4 &&
    teilCoverageRatio >= 0.9 &&
    topicCoverageRatio >= 0.75
  ) {
    verdictTitle = `Exam-Ready for ${mastery.standardLevel} — Ready to Level Up!`;
    verdictTone = "ready";
    verdictDetail = `All 4 skills, ${testedTeileTotal}/${totalTeileCount} Teile, and ${topicsTrainedCount}/${totalTopicsCount} topic categories are well covered. You're ready for the ${mastery.examName}!`;
  } else if (
    overallReadiness >= 66 &&
    skillsPassingCount >= 3 &&
    teilCoverageRatio >= 0.8 &&
    topicCoverageRatio >= 0.625
  ) {
    verdictTitle = `High Chance to Pass ${mastery.standardLevel}!`;
    verdictTone = "high";
    verdictDetail = `Strong accuracy across ${testedTeileTotal}/${totalTeileCount} Teile and ${topicsTrainedCount}/${totalTopicsCount} topic categories. Train „${weakestVocab?.titleDe ?? "your weakest topic"}“ (${weakestVocab?.progressPct ?? 0}%) to eliminate topic blind spots.`;
  } else if (overallReadiness >= 52 && skillsPassingCount >= 2) {
    verdictTitle = `Approaching Safe Passing Margin (~${mastery.standardLevel})`;
    verdictTone = "passing";
    verdictDetail = `Solid progress (${testedTeileTotal}/${totalTeileCount} Teile · ${topicsTrainedCount}/${totalTopicsCount} topics trained). Strengthen „${weakestVocab?.titleDe ?? "your weakest topic"}“ (${weakestVocab?.progressPct ?? 0}%) and „${weakestGrammar?.titleDe ?? "grammar"}“ (${weakestGrammar?.masteryPct ?? 0}%) for a reliable pass.`;
  } else if (overallReadiness >= 32) {
    verdictTitle = `Bridging ${profile.currentLevel} → ${mastery.standardLevel} (${topicsTrainedCount}/${totalTopicsCount} Topics Trained)`;
    verdictTone = "approaching";
    verdictDetail = `Good momentum, but ${totalTopicsCount - topicsTrainedCount} topic categories (starting with „${weakestVocab?.titleDe ?? ""}“ at ${weakestVocab?.progressPct ?? 0}%) and ${totalTeileCount - testedTeileTotal} exam Teile still need practice.`;
  }

  const target = mastery.standardLevel;
  const cur = profile.currentLevel;
  let estimatedCefrStanding = `Early ${cur}`;
  if (overallReadiness >= 80 && skillsPassingCount === 4 && topicCoverageRatio >= 0.75)
    estimatedCefrStanding = `Strong ${target}+`;
  else if (overallReadiness >= 64 && skillsPassingCount >= 3)
    estimatedCefrStanding = `Solid ${target}`;
  else if (overallReadiness >= 48)
    estimatedCefrStanding = `Upper ${cur} / Early ${target}`;
  else if (overallReadiness >= 28)
    estimatedCefrStanding = `Bridging ${cur} → ${target}`;
  else estimatedCefrStanding = `Solid ${cur}`;

  return {
    overallReadiness,
    skillsAvg,
    vocabAvg,
    topicBreadthPct,
    topicsTrainedCount,
    topicsStrongCount,
    totalTopicsCount,
    grammarAvg,
    skillsPassingCount,
    passProbabilityPct,
    testedTeileTotal,
    totalTeileCount,
    verdictTitle,
    verdictTone,
    verdictDetail,
    estimatedCefrStanding,
    weakestSkill,
    weakestVocab,
    weakestGrammar,
    readyForNextHorizon:
      overallReadiness >= 75 &&
      skillsPassingCount >= 3 &&
      teilCoverageRatio >= 0.85 &&
      topicCoverageRatio >= 0.75,
  };
}

export interface PartPacingStats {
  partNumber: number;
  shortLabel: string;
  titleDe: string;
  officialMinutes: number;
  attemptsCount: number;
  avgDurationSec: number | null;
  bestDurationSec: number | null;
  lastDurationSec: number | null;
  predictedMinutes: number | null;
  isEstimated: boolean;
}

export interface SkillPacingSummary {
  skill: "hoeren" | "lesen" | "schreiben";
  labelDe: string;
  labelEn: string;
  officialTotalMinutes: number;
  timedAttemptsCount: number;
  avgTaskDurationSec: number | null;
  observedPacingRatio: number | null; // e.g., 0.82 means finishing in 82% of official time
  predictedFullExamMinutes: number | null;
  marginMinutes: number | null; // officialTotalMinutes - predictedFullExamMinutes (positive = ahead)
  status: "ahead" | "on_track" | "tight" | "no_data";
  testedPartsCount: number;
  totalPartsCount: number;
  parts: PartPacingStats[];
}

export interface TimedTaskHistoryItem {
  id: string;
  exerciseId: string;
  title: string;
  skill: "hoeren" | "lesen" | "schreiben";
  examPartLabel: string;
  durationSec: number;
  targetDurationSec: number;
  score: number;
  completedAt: string;
}

export interface PacingAnalyticsSummary {
  totalTimedAttempts: number;
  skills: Record<"hoeren" | "lesen" | "schreiben", SkillPacingSummary>;
  recentTimedTasks: TimedTaskHistoryItem[];
}

export function computePacingAnalytics(
  drillHistory: DrillAttemptRecord[]
): PacingAnalyticsSummary {
  const timedDrills = drillHistory.filter(
    (d) => typeof d.durationSec === "number" && d.durationSec > 0
  );

  const skillMetaList: Array<{
    skill: "hoeren" | "lesen" | "schreiben";
    labelDe: string;
    labelEn: string;
  }> = [
    { skill: "hoeren", labelDe: "Hören", labelEn: "Listening" },
    { skill: "lesen", labelDe: "Lesen", labelEn: "Reading" },
    { skill: "schreiben", labelDe: "Schreiben", labelEn: "Writing" },
  ];

  const skills = {} as Record<"hoeren" | "lesen" | "schreiben", SkillPacingSummary>;

  for (const meta of skillMetaList) {
    const bp = GOETHE_B1_BLUEPRINT[meta.skill];
    const skillTimed = timedDrills.filter((d) => d.skill === meta.skill);

    // Group timed attempts by partNumber
    const byPart = new Map<number, DrillAttemptRecord[]>();
    for (const part of bp.parts) {
      byPart.set(part.partNumber, []);
    }

    for (const d of skillTimed) {
      const pNum = inferDrillPartNum(d, bp.parts.length);
      const list = byPart.get(pNum) ?? [];
      list.push(d);
      byPart.set(pNum, list);
    }

    // Compute observed pacing ratio across all timed attempts in this skill
    // (actual duration / official target duration)
    let ratioSum = 0;
    let ratioCount = 0;
    for (const d of skillTimed) {
      const targetSec =
        d.targetDurationSec && d.targetDurationSec > 0
          ? d.targetDurationSec
          : getExerciseTargetSeconds(d.exercise);
      if (targetSec > 0 && d.durationSec) {
        ratioSum += d.durationSec / targetSec;
        ratioCount += 1;
      }
    }

    const rawRatio = ratioCount > 0 ? ratioSum / ratioCount : null;
    const clampedRatio =
      rawRatio !== null ? Math.max(0.35, Math.min(2.2, rawRatio)) : null;

    let testedPartsCount = 0;
    let predictedTotalSec = 0;

    const parts: PartPacingStats[] = bp.parts.map((part) => {
      const records = byPart.get(part.partNumber) ?? [];
      if (records.length > 0) {
        testedPartsCount += 1;
        const durations = records.map((r) => r.durationSec!);
        const avgSec = Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length
        );
        const bestSec = Math.min(...durations);
        const lastSec = durations[0]; // newest-first
        predictedTotalSec += avgSec;

        return {
          partNumber: part.partNumber,
          shortLabel: part.shortLabel,
          titleDe: part.titleDe,
          officialMinutes: part.recommendedMinutes,
          attemptsCount: records.length,
          avgDurationSec: avgSec,
          bestDurationSec: bestSec,
          lastDurationSec: lastSec,
          predictedMinutes: Math.round((avgSec / 60) * 10) / 10,
          isEstimated: false,
        };
      }

      // Untested part: extrapolate using the learner's observed pacing ratio in this skill
      const estSec =
        clampedRatio !== null
          ? Math.round(part.recommendedMinutes * 60 * clampedRatio)
          : null;
      if (estSec !== null) {
        predictedTotalSec += estSec;
      }

      return {
        partNumber: part.partNumber,
        shortLabel: part.shortLabel,
        titleDe: part.titleDe,
        officialMinutes: part.recommendedMinutes,
        attemptsCount: 0,
        avgDurationSec: null,
        bestDurationSec: null,
        lastDurationSec: null,
        predictedMinutes:
          estSec !== null ? Math.round((estSec / 60) * 10) / 10 : null,
        isEstimated: true,
      };
    });

    const avgTaskDurationSec =
      skillTimed.length > 0
        ? Math.round(
            skillTimed.reduce((sum, d) => sum + (d.durationSec ?? 0), 0) /
              skillTimed.length
          )
        : null;

    const predictedFullExamMinutes =
      skillTimed.length > 0
        ? Math.round((predictedTotalSec / 60) * 10) / 10
        : null;

    const marginMinutes =
      predictedFullExamMinutes !== null
        ? Math.round((bp.totalMinutes - predictedFullExamMinutes) * 10) / 10
        : null;

    let status: SkillPacingSummary["status"] = "no_data";
    if (marginMinutes !== null) {
      if (marginMinutes >= 4) status = "ahead";
      else if (marginMinutes >= -2) status = "on_track";
      else status = "tight";
    }

    skills[meta.skill] = {
      skill: meta.skill,
      labelDe: meta.labelDe,
      labelEn: meta.labelEn,
      officialTotalMinutes: bp.totalMinutes,
      timedAttemptsCount: skillTimed.length,
      avgTaskDurationSec,
      observedPacingRatio:
        rawRatio !== null ? Math.round(rawRatio * 100) / 100 : null,
      predictedFullExamMinutes,
      marginMinutes,
      status,
      testedPartsCount,
      totalPartsCount: bp.parts.length,
      parts,
    };
  }

  const recentTimedTasks: TimedTaskHistoryItem[] = timedDrills
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      exerciseId: d.exerciseId,
      title: d.exercise.title,
      skill: d.skill,
      examPartLabel: d.exercise.examPartLabel,
      durationSec: d.durationSec!,
      targetDurationSec:
        d.targetDurationSec && d.targetDurationSec > 0
          ? d.targetDurationSec
          : getExerciseTargetSeconds(d.exercise),
      score: d.grade.score,
      completedAt: d.completedAt,
    }));

  return {
    totalTimedAttempts: timedDrills.length,
    skills,
    recentTimedTasks,
  };
}
