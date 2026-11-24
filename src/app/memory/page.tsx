"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Brain,
  CheckCircle2,
  History,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { speakGerman } from "@/lib/speech";
import {
  BottleneckCategory,
  BottleneckSeverity,
  DatabaseSchema,
} from "@/lib/types";

export default function MemoryPage() {
  const router = useRouter();
  const [state, setState] = useState<DatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "mastered">("active");

  // Add bottleneck form
  const [showAddBn, setShowAddBn] = useState(false);
  const [bnTitle, setBnTitle] = useState("");
  const [bnCategory, setBnCategory] = useState<BottleneckCategory>("grammar");
  const [bnDescription, setBnDescription] = useState("");
  const [bnMistake, setBnMistake] = useState("");
  const [bnBetter, setBnBetter] = useState("");

  // Add vocab form
  const [showAddVocab, setShowAddVocab] = useState(false);
  const [vocDe, setVocDe] = useState("");
  const [vocMeaning, setVocMeaning] = useState("");
  const [vocExample, setVocExample] = useState("");

  async function loadState() {
    const res = await fetch("/api/state");
    const data = (await res.json()) as DatabaseSchema;
    setState(data);
    setLoading(false);
  }

  useEffect(() => {
    loadState();
  }, []);

  async function handleDrillBottleneck(bottleneckId: string) {
    setLaunchingId(bottleneckId);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleneckId }),
      });
      const data = await res.json();
      if (data?.session?.id) {
        router.push(`/session/${data.session.id}`);
      }
    } finally {
      setLaunchingId(null);
    }
  }

  async function handleUpdateSeverity(id: string, severity: BottleneckSeverity) {
    const res = await fetch("/api/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "bottleneck", id, patch: { severity } }),
    });
    const data = await res.json();
    if (data.state) setState(data.state);
  }

  async function handleDeleteBottleneck(id: string) {
    const res = await fetch(`/api/memory?type=bottleneck&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.state) setState(data.state);
  }

  async function handleAddBottleneck(e: React.FormEvent) {
    e.preventDefault();
    if (!bnTitle.trim()) return;
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "bottleneck",
        title: bnTitle.trim(),
        category: bnCategory,
        description: bnDescription.trim(),
        exampleMistake: bnMistake.trim(),
        betterGerman: bnBetter.trim(),
        severity: "high",
      }),
    });
    const data = await res.json();
    if (data.state) setState(data.state);
    setBnTitle("");
    setBnDescription("");
    setBnMistake("");
    setBnBetter("");
    setShowAddBn(false);
  }

  async function handleAddVocab(e: React.FormEvent) {
    e.preventDefault();
    if (!vocDe.trim()) return;
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "vocabulary",
        german: vocDe.trim(),
        meaning: vocMeaning.trim(),
        exampleDe: vocExample.trim() || vocDe.trim(),
        topic: "Saved Phrase",
      }),
    });
    const data = await res.json();
    if (data.state) setState(data.state);
    setVocDe("");
    setVocMeaning("");
    setVocExample("");
    setShowAddVocab(false);
  }

  async function handleDeleteVocab(id: string) {
    const res = await fetch(`/api/memory?type=vocabulary&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.state) setState(data.state);
  }

  if (loading || !state) {
    return <div className="h-64 animate-pulse bg-zinc-200 rounded-2xl" />;
  }

  const { memory, sessions, aiConfig, drillHistory } = state;
  const shownBottlenecks = memory.bottlenecks.filter((b) =>
    filter === "active" ? b.severity !== "mastered" : b.severity === "mastered"
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
          Persistent Learner Memory
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
          What Your Coach Remembers About You
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Every speaking session automatically updates your bottlenecks, strengths,
          and saved German phrases so future plans target your fastest path to
          fluency.
        </p>
      </div>

      {/* Memory Overview Card */}
      <section className="rounded-2xl bg-zinc-900 text-white p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <Brain className="w-4 h-4" />
          <span>Current Coach Snapshot</span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{memory.summary}</p>
        <div className="pt-2 border-t border-white/10 text-xs text-zinc-400">
          <span className="text-zinc-200 font-semibold">Last Session: </span>
          {memory.lastSessionRecap}
        </div>
      </section>

      {/* Bottlenecks Section */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Speaking Bottlenecks
            </h2>
            <p className="text-xs text-zinc-500">
              High-leverage habits holding back your current level. Launch a targeted
              voice drill on any item!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-zinc-100 p-1 text-xs font-medium">
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filter === "active"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500"
                }`}
              >
                Active (
                {memory.bottlenecks.filter((b) => b.severity !== "mastered").length})
              </button>
              <button
                onClick={() => setFilter("mastered")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filter === "mastered"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500"
                }`}
              >
                Mastered (
                {memory.bottlenecks.filter((b) => b.severity === "mastered").length})
              </button>
            </div>

            <button
              onClick={() => setShowAddBn((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {showAddBn && (
          <form
            onSubmit={handleAddBottleneck}
            className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={bnTitle}
                onChange={(e) => setBnTitle(e.target.value)}
                placeholder="Bottleneck title (e.g. Dativ after mit/bei/nach)"
                className="sm:col-span-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                required
              />
              <select
                value={bnCategory}
                onChange={(e) =>
                  setBnCategory(e.target.value as BottleneckCategory)
                }
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="fluency">Fluency</option>
                <option value="pronunciation">Pronunciation</option>
                <option value="exam_strategy">Exam Strategy</option>
              </select>
            </div>
            <input
              value={bnDescription}
              onChange={(e) => setBnDescription(e.target.value)}
              placeholder="Short description of what trips you up..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={bnMistake}
                onChange={(e) => setBnMistake(e.target.value)}
                placeholder="Typical mistake (e.g. Ich fahre mit der Zug)"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={bnBetter}
                onChange={(e) => setBnBetter(e.target.value)}
                placeholder="Target German (e.g. Ich fahre mit dem Zug)"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBn(false)}
                className="text-xs px-3 py-1.5 text-zinc-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-900 text-white cursor-pointer"
              >
                Save Bottleneck
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {shownBottlenecks.length === 0 ? (
            <div className="text-sm text-zinc-500 py-6 text-center">
              No {filter} bottlenecks recorded here.
            </div>
          ) : (
            shownBottlenecks.map((bn) => (
              <div
                key={bn.id}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">
                        {bn.title}
                      </span>
                      <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 font-semibold">
                        {bn.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Seen {bn.occurrences}×
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">{bn.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={bn.severity}
                      onChange={(e) =>
                        handleUpdateSeverity(
                          bn.id,
                          e.target.value as BottleneckSeverity
                        )
                      }
                      className="text-xs rounded-lg border border-zinc-200 bg-white px-2 py-1.5 font-medium"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium</option>
                      <option value="improving">Improving</option>
                      <option value="mastered">Mastered</option>
                    </select>

                    <button
                      onClick={() => handleDrillBottleneck(bn.id)}
                      disabled={launchingId !== null}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-400" />
                      <span>
                        {launchingId === bn.id ? "Starting..." : "Drill Now"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteBottleneck(bn.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete bottleneck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {(bn.exampleMistake || bn.betterGerman) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {bn.exampleMistake && (
                      <div className="rounded-lg bg-rose-50 border border-rose-200/70 px-3 py-2 text-rose-900">
                        <span className="font-semibold">Habit: </span>
                        {bn.exampleMistake}
                      </div>
                    )}
                    {bn.betterGerman && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200/70 px-3 py-2 text-emerald-900 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold">Natural: </span>
                          {bn.betterGerman}
                        </div>
                        <button
                          onClick={() =>
                            speakGerman(bn.betterGerman, {
                              rate: aiConfig.voiceRate || 0.95,
                              ttsProvider: aiConfig.ttsProvider ?? "edge_neural",
                              edgeVoice: aiConfig.edgeVoice,
                              voiceName: aiConfig.preferredVoiceName || undefined,
                            })
                          }
                          className="p-1 rounded hover:bg-emerald-100 cursor-pointer shrink-0"
                          title="Hear German"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Two-Column: Vocabulary Bank & Past Sessions + Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vocabulary & Redemittel Bank */}
        <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-teal-600" />
              Saved German Phrases ({memory.vocabulary.length})
            </h2>
            <button
              onClick={() => setShowAddVocab((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phrase</span>
            </button>
          </div>

          {showAddVocab && (
            <form
              onSubmit={handleAddVocab}
              className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 space-y-2"
            >
              <input
                value={vocDe}
                onChange={(e) => setVocDe(e.target.value)}
                placeholder="German phrase (e.g. Meiner Meinung nach...)"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs"
                required
              />
              <input
                value={vocMeaning}
                onChange={(e) => setVocMeaning(e.target.value)}
                placeholder="Meaning"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs"
              />
              <input
                value={vocExample}
                onChange={(e) => setVocExample(e.target.value)}
                placeholder="German example sentence"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 text-white cursor-pointer"
                >
                  Save Phrase
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {memory.vocabulary.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-zinc-200/70 p-3 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-zinc-900">
                    {v.german}
                  </div>
                  <div className="text-xs text-zinc-600">{v.meaning}</div>
                  {v.exampleDe && (
                    <div className="text-xs text-teal-800 italic mt-0.5">
                      „{v.exampleDe}“
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      speakGerman(v.exampleDe || v.german, {
                        rate: aiConfig.voiceRate || 0.95,
                        ttsProvider: aiConfig.ttsProvider ?? "edge_neural",
                        edgeVoice: aiConfig.edgeVoice,
                        voiceName: aiConfig.preferredVoiceName || undefined,
                      })
                    }
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 cursor-pointer"
                    title="Hear pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVocab(v.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strengths + Session History */}
        <div className="space-y-5">
          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Recorded Strengths
            </h2>
            <ul className="space-y-2">
              {memory.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-zinc-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Past Speaking Sessions ({sessions.length})
            </h2>
            {sessions.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No sessions yet. Complete your first voice conversation to build
                your history!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/session/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 px-3.5 py-2.5 hover:bg-zinc-50 transition"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 truncate">
                        {s.moduleTitle}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {new Date(s.startedAt).toLocaleDateString()} ·{" "}
                        {s.turnCount} turns
                      </div>
                    </div>
                    {s.debrief ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        {s.debrief.overallScore}/100
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">
                        Resume
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-teal-600" />
                Completed &amp; Saved Exercises ({(drillHistory ?? []).length})
              </h2>
              <Link
                href="/exercises"
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                All Exercises →
              </Link>
            </div>
            {(drillHistory ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500">
                No completed Hören, Lesen, or Schreiben drills yet. Completed &amp;
                AI-generated exercises are saved here for easy review.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(drillHistory ?? []).map((att) => (
                  <Link
                    key={att.id}
                    href={`/train/${att.skill}?reviewAttemptId=${encodeURIComponent(
                      att.id
                    )}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/70 px-3.5 py-2.5 hover:bg-zinc-50 transition"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 truncate">
                        {att.exercise.title}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {att.exercise.examPartLabel} ·{" "}
                        {new Date(att.completedAt).toLocaleDateString()}
                        {att.exercise.source === "ai_generated"
                          ? " · AI Saved"
                          : ""}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        att.grade.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {att.grade.score}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
