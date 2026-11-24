import { NextResponse } from "next/server";
import {
  getSanitizedState,
  readDb,
  resetDb,
  updateProfileAndConfig,
} from "@/lib/db";

export async function GET(request: Request) {
  const db = readDb();
  const url = new URL(request.url);
  if (url.searchParams.get("lite") === "1") {
    return NextResponse.json({
      profile: {
        currentLevel: db.profile.currentLevel,
        targetLevel: db.profile.targetLevel,
        goalTitle: db.profile.goalTitle,
      },
      aiConfig: {
        provider: db.aiConfig.provider,
      },
    });
  }
  return NextResponse.json(getSanitizedState(db));
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = updateProfileAndConfig(body.profile, body.aiConfig);
    return NextResponse.json(getSanitizedState(updated));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const fresh = resetDb();
  return NextResponse.json(getSanitizedState(fresh));
}
