import { NextResponse } from "next/server";
import { researchTopicsForGoal } from "@/lib/ai/coach";
import {
  getSanitizedState,
  readDb,
  saveResearch,
  updateProfileAndConfig,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.profile) {
      updateProfileAndConfig(body.profile);
    }
    const db = readDb();
    const research = await researchTopicsForGoal(db);
    const updated = saveResearch(research);
    return NextResponse.json({
      research,
      state: getSanitizedState(updated),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Topic research failed" },
      { status: 500 }
    );
  }
}
