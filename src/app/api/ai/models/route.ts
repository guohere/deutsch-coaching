import { NextResponse } from "next/server";
import { discoverProviderModels } from "@/lib/ai/providers";
import { readDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = readDb();
    const mergedConfig = {
      ...db.aiConfig,
      ...(body.aiConfig ?? {}),
    };

    const result = await discoverProviderModels(mergedConfig);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        models: [],
        message:
          err instanceof Error
            ? err.message
            : "Could not fetch available models",
      },
      { status: 200 }
    );
  }
}
