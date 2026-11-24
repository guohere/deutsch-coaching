import {
  CefrLevel,
  ModuleCategory,
  StudyModule,
  TopicResearchResult,
} from "./types";

export const GOAL_PRESETS = [
  {
    id: "goethe-b1",
    label: "Goethe-Zertifikat B1 Exam",
    targetLevel: "B1" as CefrLevel,
    details:
      "Pass all 3 parts of Goethe-Zertifikat B1 Sprechen (Teil 1: Gemeinsam etwas planen, Teil 2: Ein Thema präsentieren, Teil 3: Über ein Thema sprechen / Rückmeldung geben) with confident grammar and fluency.",
  },
  {
    id: "goethe-b2",
    label: "Goethe-Zertifikat B2 Exam",
    targetLevel: "B2" as CefrLevel,
    details:
      "Master Goethe B2 Sprechen (Teil 1: Kurzvortrag halten & Rückfragen beantworten, Teil 2: Diskussion / Pro-Contra-Debatte) using nuanced argumentation and C-level connectors.",
  },
  {
    id: "goethe-a2",
    label: "Goethe-Zertifikat A2 Exam",
    targetLevel: "A2" as CefrLevel,
    details:
      "Build reliable everyday speaking for Goethe A2 Sprechen (Teil 1: Fragen stellen, Teil 2: Über sich erzählen, Teil 3: Gemeinsam etwas planen).",
  },
  {
    id: "telc-b1",
    label: "telc Deutsch B1 Exam",
    targetLevel: "B1" as CefrLevel,
    details:
      "Prepare for telc B1 Mündliche Prüfung (Kontaktaufnahme, Gespräch über ein Thema, Gemeinsam etwas planen).",
  },
  {
    id: "work-daily-b1",
    label: "Everyday Life & Job Interviews in Germany",
    targetLevel: "B1" as CefrLevel,
    details:
      "Speak naturally in daily German situations, doctor/office appointments, workplace standups, and job interviews.",
  },
];

export const CATEGORY_META: Record<
  ModuleCategory,
  { label: string; badge: string; color: string }
> = {
  exam_teil1_planning: {
    label: "Exam Teil 1: Planning",
    badge: "Teil 1 · Planen",
    color: "bg-amber-100 text-amber-900 border-amber-200",
  },
  exam_teil2_presentation: {
    label: "Exam Teil 2: Presentation",
    badge: "Teil 2 · Präsentation",
    color: "bg-teal-100 text-teal-900 border-teal-200",
  },
  exam_teil3_discussion: {
    label: "Exam Teil 3: Feedback & Q&A",
    badge: "Teil 3 · Rückmeldung",
    color: "bg-indigo-100 text-indigo-900 border-indigo-200",
  },
  everyday_roleplay: {
    label: "Everyday Roleplay",
    badge: "Alltag · Roleplay",
    color: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  bottleneck_drill: {
    label: "Bottleneck Drill",
    badge: "Targeted Drill",
    color: "bg-rose-100 text-rose-900 border-rose-200",
  },
  listening_qa: {
    label: "Listening & Spontaneous Q&A",
    badge: "Hören & Sprechen",
    color: "bg-sky-100 text-sky-900 border-sky-200",
  },
};

export function getCuratedResearch(
  currentLevel: CefrLevel,
  targetLevel: CefrLevel,
  goal: string
): TopicResearchResult {
  const lowerGoal = goal.toLowerCase();
  const isB2 = targetLevel === "B2" || lowerGoal.includes("b2");
  const isA2 = targetLevel === "A2" || lowerGoal.includes("a2");

  if (isB2) {
    return {
      id: `research-b2-${Date.now()}`,
      goal,
      currentLevel,
      targetLevel: "B2",
      searchedAt: new Date().toISOString(),
      sourceMode: "curated_blueprint",
      summary:
        "Goethe-Zertifikat B2 Sprechen tests structured argumentation, weighing pros & cons, presenting alternatives, and reacting spontaneously in formal and semi-formal discussions.",
      examFormat: [
        {
          part: "Teil 1: Vortrag halten (~4 min + Q&A)",
          duration: "4 min",
          description:
            "Present a complex topic, describe multiple alternatives/options, evaluate advantages and disadvantages, and answer your partner's and examiner's follow-up questions.",
          tips: [
            "Use clear signposting: 'Zunächst möchte ich...', 'Ein weiterer Aspekt ist...', 'Abschließend lässt sich sagen...'",
            "Compare at least 2 concrete alternatives instead of only describing one.",
          ],
        },
        {
          part: "Teil 2: Diskussion führen (~5 min)",
          duration: "5 min",
          description:
            "Debate a controversial issue with a partner, defend your stance with examples, respond directly to counterarguments, and reach a balanced conclusion.",
          tips: [
            "Acknowledge before disagreeing: 'Da hast du zwar recht, aber man muss auch bedenken...'",
            "Use Konjunktiv II and passive voice naturally to sound nuanced.",
          ],
        },
      ],
      canDoCompetencies: [
        "Deliver a clear, systematically developed presentation highlighting significant points and relevant supporting detail.",
        "Engage in active debate, accounting for and sustaining opinions by providing relevant explanations and arguments.",
        "Use complex connectors (obwohl, während, einerseits... andererseits, infolgedessen, dennoch).",
        "Self-correct slips fluently without breaking communication rhythm.",
      ],
      trendingTopics: [
        {
          topicDe: "Künstliche Intelligenz am Arbeitsplatz",
          topicEn: "AI in the Workplace",
          whyImportant: "Frequent modern B2 debate theme combining work, ethics, and education.",
          samplePromptDe:
            "Sollten Unternehmen KI-Tools verpflichtend einführen? Diskutieren Sie Chancen und Risiken.",
        },
        {
          topicDe: "Autofreie Innenstädte & Verkehrswende",
          topicEn: "Car-free City Centers & Mobility",
          whyImportant: "Classic German societal debate testing pros/cons and compromise language.",
          samplePromptDe:
            "Welche Alternativen zum eigenen Auto gibt es in Großstädten, und wie realistisch sind sie?",
        },
        {
          topicDe: "Vier-Tage-Woche & Work-Life-Balance",
          topicEn: "Four-Day Work Week",
          whyImportant: "Tests formal workplace vocabulary and conditional reasoning.",
          samplePromptDe:
            "Ist die Vier-Tage-Woche bei vollem Lohnausgleich zukunftsfähig?",
        },
        {
          topicDe: "Soziale Medien und mentale Gesundheit",
          topicEn: "Social Media & Mental Health",
          whyImportant: "High-frequency theme for both Teil 1 Vortrag and Teil 2 Diskussion.",
          samplePromptDe:
            "Brauchen Jugendliche strengere Altersgrenzen für soziale Netzwerke?",
        },
      ],
      keyGrammarTargets: [
        "Zweiteilige Konnektoren (sowohl... als auch, weder... noch, je... desto, zwar... aber)",
        "Konjunktiv II in höflicher Kritik & Hypothesen",
        "Passiv & Passiversatzformen (sich lassen, -bar)",
        "Nominalisierung vs. Verbalstil im Vortrag",
        "Präpositionen mit Genitiv (trotz, aufgrund, während, wegen)",
      ],
    };
  }

  if (isA2) {
    return {
      id: `research-a2-${Date.now()}`,
      goal,
      currentLevel,
      targetLevel: "A2",
      searchedAt: new Date().toISOString(),
      sourceMode: "curated_blueprint",
      summary:
        "Goethe-Zertifikat A2 Sprechen checks whether you can handle direct everyday exchanges, talk about familiar routines/experiences, and arrange a simple meeting or activity.",
      examFormat: [
        {
          part: "Teil 1: Fragen zur Person stellen & beantworten",
          duration: "3–4 min",
          description:
            "Draw 4 keyword cards (e.g., Wohnort, Freizeit, Beruf, Urlaub) and ask/answer clear W-questions and Ja/Nein questions.",
          tips: [
            "Keep verb in position 2 for W-questions ('Wo wohnen Sie?') and position 1 for Ja/Nein questions.",
            "Give 2-sentence answers instead of single words.",
          ],
        },
        {
          part: "Teil 2: Von sich erzählen",
          duration: "3–4 min",
          description:
            "Speak briefly about a familiar topic using 4 guiding prompts (e.g., 'Was machen Sie am Wochenende?').",
          tips: [
            "Cover all 4 bullet points smoothly using 'und', 'aber', 'weil', 'danach'.",
          ],
        },
        {
          part: "Teil 3: Etwas gemeinsam planen",
          duration: "3–4 min",
          description:
            "Find a free time slot in a weekly calendar and agree on a simple activity with your partner.",
          tips: [
            "Use 'Hast du am ... Zeit?', 'Leider kann ich da nicht, weil...', 'Wie wäre es am...?'",
          ],
        },
      ],
      canDoCompetencies: [
        "Ask and answer simple questions about daily life, family, shopping, work, and hobbies.",
        "Talk about past events clearly using Perfekt (haben/sein + Partizip II).",
        "Make simple suggestions, accept or politely decline, and agree on a time/place.",
        "Use modal verbs (können, müssen, wollen, möchten) reliably in conversation.",
      ],
      trendingTopics: [
        {
          topicDe: "Wochenende & Freizeitaktivitäten",
          topicEn: "Weekend & Free Time",
          whyImportant: "Core A2 Teil 2 & Teil 3 topic.",
          samplePromptDe: "Was machst du gern am Wochenende? Mit wem und wo?",
        },
        {
          topicDe: "Einkaufen, Essen & Restaurant",
          topicEn: "Shopping & Eating Out",
          whyImportant: "Tests Akkusativ, prices, preferences, and polite requests.",
          samplePromptDe: "Wir möchten zusammen kochen. Was kaufen wir ein und wann treffen wir uns?",
        },
        {
          topicDe: "Wohnen, Wohnung & Nachbarschaft",
          topicEn: "Living & Apartment",
          whyImportant: "Tests Wechselpräpositionen (in, auf, neben) and describing places.",
          samplePromptDe: "Wie wohnst du? Was gefällt dir an deiner Wohnung?",
        },
        {
          topicDe: "Reisen & Verkehrsmittel",
          topicEn: "Travel & Transport",
          whyImportant: "Tests Perfekt storytelling and time expressions.",
          samplePromptDe: "Erzähl von deinem letzten Urlaub: Wohin bist du gefahren?",
        },
      ],
      keyGrammarTargets: [
        "Perfekt mit haben vs. sein (ich bin gefahren, ich habe gegessen)",
        "Modalverben im Präsens (Satzklammer: Ich muss heute lange arbeiten)",
        "Nebensätze mit weil und dass (Verb am Ende)",
        "Akkusativ & Dativ mit häufigen Präpositionen (mit, für, zu, bei)",
        "Trennbare Verben im Alltag (einkaufen, aufstehen, mitbringen)",
      ],
    };
  }

  // Default: Goethe-Zertifikat B1 (most requested and matches user example!)
  return {
    id: `research-b1-${Date.now()}`,
    goal,
    currentLevel,
    targetLevel: "B1",
    searchedAt: new Date().toISOString(),
    sourceMode: "curated_blueprint",
    summary:
      "Goethe-Zertifikat B1 Sprechen (~15 minutes) evaluates your ability to plan an event collaboratively, deliver a structured 3-minute presentation on a real-life topic, and respond naturally to feedback and follow-up questions.",
    examFormat: [
      {
        part: "Teil 1: Gemeinsam etwas planen",
        duration: "3–4 min",
        description:
          "You and a partner plan an event or solve a practical task together (e.g., organizing a farewell party, visiting a sick friend, planning a weekend excursion) covering 4 guiding points (Wann, Wo, Was mitbringen, Verkehrsmittel/Kosten).",
        tips: [
          "Don't just agree — make a proposal, ask your partner's opinion, negotiate one small conflict, and confirm the final plan.",
          "Key Redemittel: 'Ich schlage vor, dass...', 'Was hältst du davon, wenn...?', 'Einverstanden, dann machen wir das so!'",
        ],
      },
      {
        part: "Teil 2: Ein Thema präsentieren",
        duration: "3–4 min",
        description:
          "Present a chosen everyday/societal topic following 5 classic Goethe slides: 1) Personal experience, 2) Situation in your home country, 3) Pros & cons + your opinion, 4) Conclusion & thanking the audience.",
        tips: [
          "Always signpost each section clearly so examiners hear your structure.",
          "Include at least 2 advantages, 2 disadvantages, and a clear personal opinion.",
        ],
      },
      {
        part: "Teil 3: Über ein Thema sprechen (Rückmeldung & Fragen)",
        duration: "2–3 min",
        description:
          "React to your partner's presentation with polite feedback and ask a thoughtful follow-up question — and answer questions about your own presentation spontaneously.",
        tips: [
          "Praise one specific detail first ('Besonders interessant fand ich...'), then ask an open question.",
        ],
      },
    ],
    canDoCompetencies: [
      "Collaborate to plan events, negotiate details, and handle minor disagreements politely in German.",
      "Give a connected 3-minute mini-presentation comparing home-country habits with Germany and weighing pros & cons.",
      "Connect ideas smoothly using Nebensätze (weil, obwohl, dass, wenn, damit) with verb-final word order.",
      "Express wishes, polite suggestions, and hypotheticals using Konjunktiv II (könnte, würde, hätte, wäre).",
      "React spontaneously to follow-up questions without reverting to English.",
    ],
    trendingTopics: [
      {
        topicDe: "Homeoffice vs. Arbeit im Büro",
        topicEn: "Remote Work vs. Office Work",
        whyImportant: "One of the most frequent recent B1 Teil 2 presentation topics.",
        samplePromptDe:
          "Präsentieren Sie das Thema 'Arbeiten im Homeoffice': Erfahrungen, Situation im Heimatland, Vor- und Nachteile.",
      },
      {
        topicDe: "Umweltschutz im Alltag & Plastik vermeiden",
        topicEn: "Everyday Environmental Protection",
        whyImportant: "Top recurring Goethe B1 topic testing modal verbs and 'damit / um...zu'.",
        samplePromptDe:
          "Was können wir im Alltag für die Umwelt tun? Brauchen wir strengere Regeln?",
      },
      {
        topicDe: "Smartphones & Soziale Medien bei Kindern/Jugendlichen",
        topicEn: "Smartphones & Social Media",
        whyImportant: "Classic B1 opinion & pros/cons topic with rich everyday vocabulary.",
        samplePromptDe:
          "Ab welchem Alter sollten Kinder ein eigenes Smartphone haben?",
      },
      {
        topicDe: "Gesunde Ernährung, Fast Food & Sport",
        topicEn: "Healthy Eating & Fitness",
        whyImportant: "Frequently tested in both Teil 2 presentations and Teil 1 planning.",
        samplePromptDe:
          "Wie wichtig ist gesunde Ernährung heute? Kochen die Menschen noch selbst?",
      },
      {
        topicDe: "Wohnen in der Großstadt oder auf dem Land",
        topicEn: "City vs. Countryside Living",
        whyImportant: "Great for practicing comparisons, 'obwohl', and personal reasons.",
        samplePromptDe:
          "Welche Vor- und Nachteile hat das Leben in der Großstadt im Vergleich zum Land?",
      },
      {
        topicDe: "Online-Shopping vs. Einkaufen im Geschäft",
        topicEn: "Online Shopping vs. In-Store",
        whyImportant: "Common real-world B1 exam card topic.",
        samplePromptDe:
          "Kaufen Sie lieber im Internet oder im Geschäft ein? Begründen Sie Ihre Meinung.",
      },
    ],
    keyGrammarTargets: [
      "Nebensätze & Verbposition am Ende (weil, dass, obwohl, wenn, damit)",
      "Konjunktiv II für Vorschläge & Höflichkeit (wir könnten, ich würde vorschlagen, es wäre gut)",
      "Relativsätze (der/die/das, in dem, mit denen) für präzisere Beschreibungen",
      "Perfekt vs. Präteritum (war, hatte, konnte, wollte) beim Erzählen",
      "Wechselpräpositionen & Verben mit Präpositionen (sich interessieren für, denken an, warten auf)",
    ],
  };
}

export function getStarterModules(
  currentLevel: CefrLevel,
  targetLevel: CefrLevel,
  goalTitle: string
): StudyModule[] {
  const isB2 = targetLevel === "B2" || goalTitle.toLowerCase().includes("b2");
  const isA2 = targetLevel === "A2" || goalTitle.toLowerCase().includes("a2");

  if (isA2) {
    return [
      {
        id: "mod-a2-1",
        order: 0,
        title: "Warm-up Interview: Daily Routine & Free Time",
        titleDe: "Teil 1 & 2: Alltag, Arbeit und Wochenende",
        category: "everyday_roleplay",
        targetLevel: "A2",
        durationMinutes: 8,
        scenarioPrompt:
          "Beantworten und stellen Sie Alltagsfragen über Ihre Arbeit, Ihren Tagesablauf und Ihr letztes Wochenende im Perfekt.",
        coachRole: "Freundlicher Goethe-A2-Gesprächspartner",
        learnerGoal: "Antworten Sie in 2–3 ganzen Sätzen und stellen Sie 2 Rückfragen.",
        grammarFocus: ["Perfekt (haben/sein)", "W-Fragen & Ja/Nein-Fragen"],
        keyVocabulary: ["am Wochenende", "danach", "besonders gern", "normalerweise"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
      {
        id: "mod-a2-2",
        order: 1,
        title: "Exam Teil 3: Planning a Weekend Trip",
        titleDe: "Teil 3: Gemeinsam einen Ausflug planen",
        category: "exam_teil1_planning",
        targetLevel: "A2",
        durationMinutes: 10,
        scenarioPrompt:
          "Sie und Ihr Freund möchten am Wochenende einen Ausflug an einen See machen. Einigen Sie sich auf Tag, Uhrzeit, Verkehrsmittel und Essen.",
        coachRole: "Ihr Freund (hat am Samstagvormittag schon einen Termin)",
        learnerGoal: "Finden Sie einen gemeinsamen Termin und einigen Sie sich auf 3 Details.",
        grammarFocus: ["Modalverben (können, wollen)", "Nebensatz mit weil"],
        keyVocabulary: ["Hast du Zeit?", "Wie wäre es mit...?", "mit dem Zug", "mitbringen"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
      {
        id: "mod-a2-3",
        order: 2,
        title: "At the Doctor & Making Appointments",
        titleDe: "Beim Arzt: Symptome beschreiben & Termin vereinbaren",
        category: "everyday_roleplay",
        targetLevel: "A2",
        durationMinutes: 10,
        scenarioPrompt:
          "Rufen Sie in einer Arztpraxis an, vereinbaren Sie einen dringenden Termin und beschreiben Sie Ihre Symptome.",
        coachRole: "Freundliche Arzthelferin und Ärztin in der Praxis",
        learnerGoal: "Beschreiben Sie Ihre Beschwerden, bitten Sie um eine Krankschreibung und bestätigen Sie die Uhrzeit.",
        grammarFocus: ["seit + Dativ", "müssen / sollen"],
        keyVocabulary: ["Kopfschmerzen", "seit zwei Tagen", "der Termin", "die Krankschreibung"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
    ];
  }

  if (isB2) {
    return [
      {
        id: "mod-b2-1",
        order: 0,
        title: "Exam Teil 1: Presenting Alternatives — AI at Work",
        titleDe: "Teil 1 Vortrag: Künstliche Intelligenz im Arbeitsalltag",
        category: "exam_teil2_presentation",
        targetLevel: "B2",
        durationMinutes: 12,
        scenarioPrompt:
          "Halten Sie einen strukturierten B2-Kurzvortrag über den Einsatz von KI im Arbeitsalltag und vergleichen Sie verschiedene Alternativen.",
        coachRole: "Goethe-B2-Prüfer/in (hört zu und stellt kritische Nachfragen)",
        learnerGoal: "Stellen Sie 2 Alternativen dar, wägen Sie Vor- und Nachteile ab und beantworten Sie 2 Nachfragen.",
        grammarFocus: ["Zweiteilige Konnektoren (einerseits... andererseits)", "Passiv"],
        keyVocabulary: ["die Effizienz steigern", "Datenschutzbedenken", "im Vergleich zu", "abschließend"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
      {
        id: "mod-b2-2",
        order: 1,
        title: "Exam Teil 2: Debate — Car-Free City Centers",
        titleDe: "Teil 2 Diskussion: Autofreie Innenstädte",
        category: "exam_teil3_discussion",
        targetLevel: "B2",
        durationMinutes: 12,
        scenarioPrompt:
          "Diskutieren Sie, ob deutsche Innenstädte autofrei werden sollten. Vertreten Sie Ihren Standpunkt und finden Sie einen Kompromiss.",
        coachRole: "Prüfungspartner/in (vertritt höflich die Gegenposition)",
        learnerGoal: "Gehen Sie direkt auf Gegenargumente ein und schlagen Sie einen realistischen Kompromiss vor.",
        grammarFocus: ["Konjunktiv II", "Präpositionen mit Genitiv (trotz, aufgrund)"],
        keyVocabulary: ["meines Erachtens", "dem stimme ich nur teilweise zu", "der öffentliche Nahverkehr", "einen Kompromiss finden"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
      {
        id: "mod-b2-3",
        order: 2,
        title: "Spontaneous Q&A: Four-Day Work Week",
        titleDe: "Hören & Argumentieren: Die Vier-Tage-Woche",
        category: "listening_qa",
        targetLevel: "B2",
        durationMinutes: 10,
        scenarioPrompt:
          "Hören Sie kurze Aussagen zur Vier-Tage-Woche und reagieren Sie spontan mit einer gut begründeten Stellungnahme.",
        coachRole: "Deutscher Podcast-Moderator im Interview mit Ihnen",
        learnerGoal: "Reagieren Sie flüssig und strukturiert mit passenden Redemitteln.",
        grammarFocus: ["Nominalisierung", "Konnektoren (dennoch, infolgedessen)"],
        keyVocabulary: ["die Produktivität", "vereinbar sein mit", "hingegen", "langfristig"],
        status: "queued",
        source: "generated",
        completedCount: 0,
      },
    ];
  }

  // Default B1 Goethe Exam Roadmap
  return [
    {
      id: "mod-b1-1",
      order: 0,
      title: "Goethe B1 Teil 1: Planning a Farewell Party",
      titleDe: "Teil 1: Gemeinsam eine Abschiedsparty planen",
      category: "exam_teil1_planning",
      targetLevel: "B1",
      durationMinutes: 10,
      scenarioPrompt:
        "Ein Kollege aus Ihrem Deutschkurs zieht zurück in sein Heimatland. Planen Sie gemeinsam eine Überraschungs-Abschiedsparty: 1) Wann und um wie viel Uhr?, 2) Wo feiern wir?, 3) Wer kümmert sich um Essen und Getränke?, 4) Welches Abschiedsgeschenk kaufen wir?",
      coachRole: "Ihr Kursteilnehmer aus dem Deutschkurs (freundlich, hat eigene Gegenvorschläge, damit Sie verhandeln)",
      learnerGoal:
        "Besprechen Sie alle 4 Leitpunkte, machen Sie höfliche Vorschläge im Konjunktiv II und einigen Sie sich am Ende auf einen klaren Plan.",
      grammarFocus: ["Konjunktiv II (wir könnten / ich würde)", "Nebensätze mit weil & wenn"],
      keyVocabulary: [
        "Ich schlage vor, dass...",
        "Was hältst du davon?",
        "ein Geschenk besorgen",
        "sich um das Essen kümmern",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
    {
      id: "mod-b1-2",
      order: 1,
      title: "Goethe B1 Teil 2: Mini-Presentation — Remote Work",
      titleDe: "Teil 2 Präsentation: Arbeiten im Homeoffice",
      category: "exam_teil2_presentation",
      targetLevel: "B1",
      durationMinutes: 12,
      scenarioPrompt:
        "Halten Sie eine strukturierte 3-Minuten-Präsentation zum Thema „Arbeiten im Homeoffice“: 1) Ihre persönlichen Erfahrungen, 2) Die Situation in Ihrem Heimatland, 3) Vor- und Nachteile, 4) Ihre persönliche Meinung und Abschluss.",
      coachRole: "Freundliche/r Goethe-B1-Prüfer/in (begleitet Sie durch die Präsentationsteile und stellt Rückfragen)",
      learnerGoal:
        "Verbinden Sie alle 4 Präsentationsteile mit klaren Redemitteln und nennen Sie mindestens 2 Vorteile und 2 Nachteile.",
      grammarFocus: ["Nebensätze mit obwohl & dass", "Strukturwörter (Zuerst, Einerseits, Zusammenfassend)"],
      keyVocabulary: [
        "Ein großer Vorteil ist, dass...",
        "Auf der anderen Seite",
        "Zeit sparen",
        "der Kontakt zu Kollegen",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
    {
      id: "mod-b1-3",
      order: 2,
      title: "Goethe B1 Teil 3: Feedback & Spontaneous Follow-up Questions",
      titleDe: "Teil 3: Rückmeldung geben & Fragen beantworten",
      category: "exam_teil3_discussion",
      targetLevel: "B1",
      durationMinutes: 10,
      scenarioPrompt:
        "Ihr Gesprächspartner hält eine kurze Präsentation zum Thema „Umweltschutz im Alltag“. Geben Sie eine höfliche Rückmeldung, stellen Sie 2 Anschlussfragen und beantworten Sie die Gegenfragen zu Ihren eigenen Gewohnheiten.",
      coachRole: "Ihr Prüfungspartner (präsentiert über Umweltschutz im Alltag und stellt Ihnen Rückfragen)",
      learnerGoal:
        "Reagieren Sie spontan auf gesprochenes Deutsch, loben Sie einen konkreten Punkt und stellen Sie offene Fragen.",
      grammarFocus: ["Indirekte Fragen (Ich möchte wissen, ob...)", "damit / um...zu"],
      keyVocabulary: [
        "Besonders interessant fand ich...",
        "Ich hätte noch eine Frage dazu",
        "Müll trennen",
        "die Umwelt schützen",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
    {
      id: "mod-b1-4",
      order: 3,
      title: "Goethe B1 Teil 1: Visiting a Sick Friend in the Hospital",
      titleDe: "Teil 1: Einen kranken Freund im Krankenhaus besuchen",
      category: "exam_teil1_planning",
      targetLevel: "B1",
      durationMinutes: 10,
      scenarioPrompt:
        "Ein gemeinsamer Freund hat sich das Bein gebrochen und liegt im Krankenhaus. Planen Sie gemeinsam Ihren Besuch: 1) Wann besuchen wir ihn?, 2) Wie fahren wir zum Krankenhaus?, 3) Was bringen wir ihm mit?, 4) Wie können wir ihm danach zu Hause helfen?",
      coachRole: "Ihr Freund (arbeitet bis 17:00 Uhr und fährt lieber mit der Bahn)",
      learnerGoal:
        "Lösen Sie das Zeitproblem höflich und einigen Sie sich bei allen 4 Punkten auf eine gemeinsame Lösung.",
      grammarFocus: ["Dativ nach mit/bei/nach", "Modalverben + Infinitiv"],
      keyVocabulary: [
        "Gute Besserung wünschen",
        "die Besuchszeit",
        "für ihn einkaufen",
        "Das passt mir gut",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
    {
      id: "mod-b1-5",
      order: 4,
      title: "Goethe B1 Teil 2: City vs. Countryside Living",
      titleDe: "Teil 2: Wohnen in der Großstadt oder auf dem Land",
      category: "exam_teil2_presentation",
      targetLevel: "B1",
      durationMinutes: 12,
      scenarioPrompt:
        "Vergleichen Sie das Leben in der Großstadt mit dem Leben auf dem Land: 1) Ihre eigenen Erfahrungen (wo Sie aufgewachsen sind), 2) Situation in Ihrem Heimatland, 3) Vor- und Nachteile (Mieten, Lärm, Verkehr, Natur), 4) Wo Sie selbst lieber wohnen.",
      coachRole: "Goethe-B1-Prüfer/in (fragt nach genaueren Gründen und Vergleichen)",
      learnerGoal:
        "Nutzen Sie Komparativ-Formen und Nebensätze mit „obwohl“ und „während“ sicher beim Sprechen.",
      grammarFocus: ["Komparativ (teurer als, ruhiger als)", "Nebensätze mit obwohl"],
      keyVocabulary: [
        "die Mieten sind hoch",
        "gute Verkehrsanbindung",
        "ruhig und grün",
        "meiner Meinung nach",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
    {
      id: "mod-b1-6",
      order: 5,
      title: "Listening & Spontaneous Reaction: Everyday German Problems",
      titleDe: "Hören & Reagieren: Probleme im Alltag lösen",
      category: "listening_qa",
      targetLevel: "B1",
      durationMinutes: 10,
      scenarioPrompt:
        "Trainieren Sie spontanes Hörverstehen und Reagieren (Tipp: Blind-Listening-Modus testen!): Der Coach spielt 3 Alltagssituationen durch (Zugverspätung, falsche Lieferung, lauter Nachbar) und Sie reagieren sofort auf Deutsch.",
      coachRole: "Zugbegleiter, Kundenservice-Mitarbeiter und Nachbar in drei kurzen Rollenspielen",
      learnerGoal:
        "Verstehen Sie das gesprochene Problem sofort und reagieren Sie höflich, klar und lösungsorientiert.",
      grammarFocus: ["Höfliche Bitten (Könnten Sie bitte...)", "Perfekt beim Erklären"],
      keyVocabulary: [
        "Es tut mir leid, aber...",
        "Ich habe ein Problem mit...",
        "Könnten Sie mir weiterhelfen?",
        "eine Lösung finden",
      ],
      status: "queued",
      source: "generated",
      completedCount: 0,
    },
  ];
}
