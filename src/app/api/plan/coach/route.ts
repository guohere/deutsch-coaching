import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import {
  buildStudyPlanDiagnostics,
  generateCustomAiGrammarClinic,
} from "@/lib/study-planner";

export async function GET() {
  const db = readDb();
  const report = buildStudyPlanDiagnostics(db);
  return NextResponse.json({ report });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = readDb();
    const report = buildStudyPlanDiagnostics(db);

    if (body.mode === "record_clinic_score") {
      const clusterId = String(body.clusterId ?? "");
      const score = Number(body.score ?? 100);
      const now = new Date().toISOString();

      const updated = updateDb((state) => {
        const targetGrammarId =
          clusterId === "cluster-sentence-structure"
            ? "gram-nebensatz"
            : clusterId === "cluster-articles-cases"
            ? "gram-adjectives"
            : "gram-konjunktiv2";

        const std = state.mastery.grammarStandards.find(
          (g) => g.id === targetGrammarId
        );
        if (std) {
          std.practiceCount += 1;
          std.lastPracticedAt = now;
          const boost = score >= 75 ? 10 : 5;
          std.masteryPct = Math.min(100, std.masteryPct + boost);
        }
        state.mastery.updatedAt = now;
      });

      return NextResponse.json({
        ok: true,
        report: buildStudyPlanDiagnostics(updated),
      });
    }

    const clusterId = String(
      body.clusterId ?? "cluster-sentence-structure"
    );
    const cluster =
      report.errorClusters.find((c) => c.id === clusterId) ??
      report.errorClusters[0];

    const clinic = await generateCustomAiGrammarClinic(db, cluster);
    return NextResponse.json({ clinic });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not generate grammar clinic",
      },
      { status: 500 }
    );
  }
}
