import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("restaurants").select("id").limit(1);
    return NextResponse.json({
      ok: !error,
      version: "0.1.0",
      db: error ? "error" : "up",
      ts: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, version: "0.1.0", db: "unconfigured", ts: new Date().toISOString() },
      { status: 503 }
    );
  }
}
