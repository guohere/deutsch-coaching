export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type AiProviderType = "gemini" | "groq" | "ollama" | "demo";

export type TtsProviderType =
  | "edge_neural"
  | "gemini_tts"
  | "openai_compat"
  | "browser";

export type CoachStyle = "encouraging" | "balanced" | "exam_strict";

export type ModuleCategory =
  | "exam_teil1_planning"
  | "exam_teil2_presentation"
  | "exam_teil3_discussion"
  | "everyday_roleplay"
  | "bottleneck_drill"
  | "listening_qa";

export type ModuleStatus = "queued" | "in_progress" | "completed";

export type SessionPhase = "warmup" | "practice" | "correction_drill" | "debrief";

export type BottleneckSeverity = "high" | "medium" | "improving" | "mastered";

export type BottleneckCategory =
  | "grammar"
  | "vocabulary"
  | "fluency"
  | "pronunciation"
  | "exam_strategy";

export interface LearnerProfile {
  name: string;
  currentLevel: CefrLevel;
  targetLevel: CefrLevel;
  goalTitle: string;
  goalDetails: string;
  nativeLanguage: string;
  dailyMinutes: number;
  coachStyle: CoachStyle;
  onboardingComplete: boolean;
}

export interface AiConfig {
  provider: AiProviderType;
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  groqUseWhisper: boolean;
  ollamaBaseUrl: string;
  ollamaModel: string;
  ttsProvider: TtsProviderType;
  edgeVoice: string;
  geminiTtsVoice?: string;
  customTtsUrl: string;
  customTtsModel: string;
  customTtsVoice: string;
  customTtsApiKey: string;
  voiceRate: number;
  preferredVoiceName: string;
  autoSpeak: boolean;
  handsFreeDefault: boolean;
  blindListeningDefault: boolean;
}

export interface TopicResearchResult {
  id: string;
  goal: string;
  currentLevel: CefrLevel;
  targetLevel: CefrLevel;
  searchedAt: string;
  sourceMode: "live_search" | "ai_knowledge" | "curated_blueprint";
  summary: string;
  examFormat: Array<{
    part: string;
    duration: string;
    description: string;
    tips: string[];
  }>;
  canDoCompetencies: string[];
  trendingTopics: Array<{
    topicDe: string;
    topicEn: string;
    whyImportant: string;
    samplePromptDe: string;
  }>;
  keyGrammarTargets: string[];
  citations?: Array<{ title: string; url: string }>;
}

export interface StudyModule {
  id: string;
  order: number;
  title: string;
  titleDe: string;
  category: ModuleCategory;
  targetLevel: CefrLevel;
  durationMinutes: number;
  scenarioPrompt: string;
  coachRole: string;
  learnerGoal: string;
  grammarFocus: string[];
  keyVocabulary: string[];
  status: ModuleStatus;
  source: "generated" | "custom" | "bottleneck";
  completedCount: number;
  lastPracticedAt?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  modules: StudyModule[];
}

export interface Bottleneck {
  id: string;
  title: string;
  category: BottleneckCategory;
  description: string;
  exampleMistake: string;
  betterGerman: string;
  severity: BottleneckSeverity;
  occurrences: number;
  lastSeenAt: string;
  createdAt: string;
}

export interface VocabularyItem {
  id: string;
  german: string;
  meaning: string;
  exampleDe: string;
  topic: string;
  addedAt: string;
  mastered: boolean;
}

export interface LearnerMemory {
  summary: string;
  strengths: string[];
  bottlenecks: Bottleneck[];
  vocabulary: VocabularyItem[];
  lastSessionRecap: string;
  totalMinutesPracticed: number;
  streakDays: number;
  lastPracticeDate?: string;
}

export type WritingIssueType =
  | "spelling"
  | "capitalization"
  | "word_order"
  | "case_gender"
  | "word_choice";

export interface WritingWordIssue {
  type: WritingIssueType;
  wrong: string;
  right: string;
  rule: string;
}

export interface TurnCorrection {
  original: string;
  corrected: string;
  explanation: string;
  bottleneckTag?: string;
  issues?: WritingWordIssue[];
}

export interface AlternativeSaying {
  style: "everyday" | "natural_upgrade" | "exam_ready";
  label: string;
  german: string;
  nuance: string;
}

export interface FreeChatMessage {
  id: string;
  role: "coach" | "learner";
  textDe: string;
  translation?: string;
  timestamp: string;
  correction?: TurnCorrection | null;
  alternatives?: AlternativeSaying[];
  hints?: string[];
  memoryBridgeNote?: string;
}

export interface FreeChatRecord {
  id: string;
  themeId: string;
  themeTitle: string;
  themeTitleDe: string;
  startedAt: string;
  updatedAt: string;
  savedToMemoryAt?: string;
  turnCount: number;
  messages: FreeChatMessage[];
}

export interface SessionMessage {
  id: string;
  role: "coach" | "learner";
  textDe: string;
  translation?: string;
  phase: SessionPhase;
  timestamp: string;
  correction?: TurnCorrection | null;
  hints?: string[];
  coachNote?: string;
}

export interface SessionDebrief {
  overallScore: number;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    taskCompletion: number;
  };
  praise: string;
  summary: string;
  keyCorrections: TurnCorrection[];
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
  nextStepRecommendation: string;
}

export interface SessionRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleCategory: ModuleCategory;
  targetBottleneckId?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  currentPhase: SessionPhase;
  turnCount: number;
  messages: SessionMessage[];
  debrief?: SessionDebrief;
}

export type ExamSkill = "sprechen" | "hoeren" | "lesen" | "schreiben";

export interface SkillTeilCoverage {
  partNumber: number;
  label: string;
  uniqueTasksCount: number;
  attemptsCount: number;
  avgScore: number | null;
  readinessContribution: number;
}

export interface SkillStandardProgress {
  skill: ExamSkill;
  label: string;
  labelDe: string;
  examParts: string;
  passThreshold: number; // Official Goethe pass line = 60%
  score: number; // 0-100 current mastery estimate
  practicedAccuracyAvg?: number | null;
  uniqueTasksCount?: number;
  totalPartsCount?: number;
  testedPartsCount?: number;
  teilBreakdown?: SkillTeilCoverage[];
  sessionsCount: number;
  lastPracticedAt?: string;
}

export interface VocabCategoryProgress {
  id: string;
  titleDe: string;
  titleEn: string;
  targetWords: number;
  masteredWords: number;
  sampleWords: string[];
  progressPct: number; // 0-100
  lastPracticedAt?: string;
}

export interface GrammarStandardProgress {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  exampleDe: string;
  masteryPct: number; // 0-100
  practiceCount: number;
  lastPracticedAt?: string;
}

export interface ProgressSnapshot {
  id: string;
  date: string;
  label: string;
  skill: ExamSkill;
  sessionScore: number;
  overallReadiness: number;
}

export interface MasteryTracker {
  standardLevel: CefrLevel;
  examName: string;
  updatedAt: string;
  skills: Record<ExamSkill, SkillStandardProgress>;
  vocabCategories: VocabCategoryProgress[];
  grammarStandards: GrammarStandardProgress[];
  history: ProgressSnapshot[];
}

export type ExamQuestionFormat =
  | "mcq"
  | "richtig_falsch"
  | "ja_nein"
  | "speaker_match"
  | "ad_match";

export interface ExamPassageSection {
  id: string;
  label: string; // e.g. "Text 1", "Anzeige A", "Person 1 · Julia (29)", "Moderatorin"
  title?: string;
  speakerRole?: string;
  edgeVoice?: string; // Optional distinct neural voice for multi-speaker Hören
  textDe: string;
}

export interface ListeningReadingQuestion {
  id: string;
  itemNumber?: number; // Official Goethe item number (e.g. 1..30)
  sectionLabel?: string; // e.g. "Text 1", "Artikel A", "Person 1"
  questionType?: ExamQuestionFormat;
  questionDe: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillDrillExercise {
  id: string;
  skill: "hoeren" | "lesen" | "schreiben";
  level: CefrLevel;
  topicDe: string;
  topicEn: string;
  vocabCategoryId?: string;
  grammarStandardId?: string;
  title: string;
  examPartNumber?: 1 | 2 | 3 | 4 | 5;
  examPartLabel: string;
  officialFormatBadge?: string; // e.g. "10 Aufgaben · R/F + a/b/c · 2× hören"
  maxPlays?: 1 | 2; // Official Goethe listening rule: 2x for Teil 1 & 4, 1x for Teil 2 & 3
  recommendedMinutes?: number;
  pointsWeight?: number;
  isOfficialFullPart?: boolean;
  modelTestNumber?: number; // e.g. 1 (Modelltest 1), 2 (Modelltest 2), 3 (Modelltest 3)
  instructions: string;
  source?: "verified_bank" | "imported" | "ai_generated";
  sourceCredit?: string;
  sourceUrl?: string; // Clickable origin URL when sourced/adapted from official web exam material
  passageDe?: string; // Spoken audio for hoeren, reading text for lesen
  sections?: ExamPassageSection[]; // Multi-text (Hören Teil 1, Lesen Teil 2/3/4) or multi-speaker turns (Hören Teil 3/4)
  questions?: ListeningReadingQuestion[];
  writingContextQuoteDe?: string; // Stimulus forum post / email header (e.g. Schreiben Aufgabe 2)
  writingPromptDe?: string;
  writingBulletsDe?: string[];
  minWords?: number;
  keyVocab: Array<{ german: string; meaning: string }>;
}

export interface DrillAttemptRecord {
  id: string;
  exerciseId: string;
  skill: "hoeren" | "lesen" | "schreiben";
  exercise: SkillDrillExercise;
  answers?: Record<string, number>;
  writingText?: string;
  grade: SkillDrillGrade;
  durationSec?: number; // Actual elapsed seconds to finish the task
  targetDurationSec?: number; // Official recommended countdown seconds for this task
  completedAt: string;
}

export type WritingDifficultyMode =
  | "guided"
  | "outline_only"
  | "exam_simulation";

export interface LeitpunktStructureSuggestion {
  patternDe: string;
  insertDe: string;
  meaning: string;
  grammarHint: string;
}

export interface LeitpunktVocabSuggestion {
  german: string;
  meaning: string;
  matchTokens?: string[];
}

export interface WritingPrewriteOutline {
  registerBadgeDe: string; // e.g. "Informell (du-Form)" | "Meinungsäußerung im Forum" | "Formell (Sie-Form)"
  mainIdeasSummary?: string[]; // Bullet summary of the learner's key ideas extracted from their brainstorm
  skeleton: Array<{
    sectionLabel: string;
    goalDe: string;
    starterPhrasesDe: string[];
    completeSentencesDe?: string[]; // Ready-to-use complete German sentences based on learner's ideas
    exampleParagraphDe?: string; // Full cohesive German paragraph upgrading the learner's brainstorm
    userIdeaNote: string;
  }>;
  redemittel: Array<{
    german: string;
    meaning: string;
    purpose: string;
  }>;
  bulletCoverageCheck: Array<{
    bulletDe: string;
    coveredInNotes: boolean;
    tip: string;
    structures?: LeitpunktStructureSuggestion[];
    vocab?: LeitpunktVocabSuggestion[];
  }>;
  memoryReminder?: string;
}

export interface WritingPillarScores {
  inhalt: {
    score: number;
    maxScore: 25;
    feedback: string;
    bulletChecks?: Array<{
      bulletDe: string;
      covered: boolean;
      note: string;
    }>;
  };
  kommunikativeGestaltung: {
    score: number;
    maxScore: 25;
    registerExpected: string;
    feedback: string;
  };
  korrektheit: {
    score: number;
    maxScore: 25;
    feedback: string;
  };
  wortschatz: {
    score: number;
    maxScore: 25;
    feedback: string;
  };
}

export interface SkillDrillGrade {
  score: number;
  passed: boolean;
  praise: string;
  summary: string;
  questionResults?: Array<{
    questionId: string;
    correct: boolean;
    explanation: string;
  }>;
  writingCorrections?: TurnCorrection[];
  improvedVersionDe?: string;
  nextLevelVersionDe?: string;
  pillarScores?: WritingPillarScores;
  b1ImprovementTips?: string[];
  newBottlenecks: Array<{
    title: string;
    category: BottleneckCategory;
    description: string;
    exampleMistake: string;
    betterGerman: string;
    severity: "high" | "medium";
  }>;
  newVocabulary: Array<{
    german: string;
    meaning: string;
    exampleDe: string;
  }>;
}

export interface DatabaseSchema {
  profile: LearnerProfile;
  aiConfig: AiConfig;
  latestResearch: TopicResearchResult | null;
  plan: StudyPlan;
  memory: LearnerMemory;
  mastery: MasteryTracker;
  sessions: SessionRecord[];
  drillHistory: DrillAttemptRecord[];
  freeChats: FreeChatRecord[];
}
