import { NextResponse } from "next/server";
import { testAiProvider } from "@/lib/ai/providers";
import { readDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = readDb();
    const mergedConfig = {
      ...db.aiConfig,
      ...(body.aiConfig ?? {}),
    };

    const result = await testAiProvider(mergedConfig);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Connection test failed",
      },
      { status: 200 }
    );
  }
}
