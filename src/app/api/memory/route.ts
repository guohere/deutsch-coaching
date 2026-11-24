import { NextResponse } from "next/server";
import {
  addVocabularyItems,
  getSanitizedState,
  readDb,
  updateDb,
  upsertBottleneck,
} from "@/lib/db";

export async function GET() {
  const db = readDb();
  return NextResponse.json({ memory: db.memory, sessions: db.sessions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "bottleneck") {
      const updated = upsertBottleneck({
        title: body.title || "Speaking Bottleneck",
        category: body.category || "grammar",
        description: body.description || "",
        exampleMistake: body.exampleMistake || "",
        betterGerman: body.betterGerman || "",
        severity: body.severity || "high",
      });
      return NextResponse.json({ state: getSanitizedState(updated) });
    }

    if (body.type === "vocabulary") {
      const updated = addVocabularyItems([
        {
          german: body.german || "",
          meaning: body.meaning || "",
          exampleDe: body.exampleDe || "",
          topic: body.topic || "Custom",
        },
      ]);
      return NextResponse.json({ state: getSanitizedState(updated) });
    }

    if (body.type === "strength" && body.text) {
      const updated = updateDb((state) => {
        state.memory.strengths.unshift(String(body.text).trim());
      });
      return NextResponse.json({ state: getSanitizedState(updated) });
    }

    return NextResponse.json({ error: "Unsupported memory action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Memory update failed" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = updateDb((state) => {
      if (body.type === "bottleneck" && body.id) {
        state.memory.bottlenecks = state.memory.bottlenecks.map((b) =>
          b.id === body.id ? { ...b, ...body.patch } : b
        );
      } else if (body.type === "vocabulary" && body.id) {
        state.memory.vocabulary = state.memory.vocabulary.map((v) =>
          v.id === body.id ? { ...v, ...body.patch } : v
        );
      } else if (body.type === "summary" && typeof body.summary === "string") {
        state.memory.summary = body.summary;
      }
    });
    return NextResponse.json({ state: getSanitizedState(updated) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Patch failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    const updated = updateDb((state) => {
      if (type === "bottleneck" && id) {
        state.memory.bottlenecks = state.memory.bottlenecks.filter(
          (b) => b.id !== id
        );
      } else if (type === "vocabulary" && id) {
        state.memory.vocabulary = state.memory.vocabulary.filter(
          (v) => v.id !== id
        );
      } else if (type === "strength" && id !== null) {
        const idx = Number(id);
        state.memory.strengths = state.memory.strengths.filter((_, i) => i !== idx);
      }
    });
    return NextResponse.json({ state: getSanitizedState(updated) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 400 }
    );
  }
}
