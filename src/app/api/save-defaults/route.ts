import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { data } = await supabase
    .from("user_form_defaults")
    .select("data")
    .eq("user_id", user.id)
    .single();
  return NextResponse.json({ data: data?.data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  // Ne pas enregistrer les champs d'offre
  const {
    targetJobTitle,
    companyName,
    jobDescription,
    ...rest
  } = body || {};

  const upsert = {
    user_id: user.id,
    data: rest,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_form_defaults").upsert(upsert, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}



