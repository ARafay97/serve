import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    supabase: isSupabaseConfigured() ? "configured" : "missing env vars",
  });
}
