import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

export async function GET() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  let supabasePing: { ok: boolean; error?: string } = { ok: false };
  try {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    supabasePing.ok = !error;
    if (error) supabasePing.error = error.message;
  } catch (e: any) {
    supabasePing = { ok: false, error: e?.message || "unknown" };
  }

  let openaiPing: { ok: boolean; error?: string } = { ok: false };
  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // Lightweight capability check: retrieve the organization usage limits or models list
      // to avoid generating tokens unnecessarily.
      await client.models.list();
      openaiPing.ok = true;
    } catch (e: any) {
      openaiPing = { ok: false, error: e?.message || "unknown" };
    }
  }

  return NextResponse.json({
    auth: { isAuthenticated: !!user, error: authError?.message },
    env,
    supabase: supabasePing,
    openai: openaiPing,
  });
}


