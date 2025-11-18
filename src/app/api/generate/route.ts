import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { aiConfig } from "@/lib/ai/aiConfig";

// On accepte le payload complet défini par requestSchema; on valide faiblement
const InputSchema = z.record(z.string(), z.any());

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const input = parsed.data;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_MISCONFIGURED" }, { status: 500 });
  }

  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, free_pack_used")
    .eq("id", user.id)
    .single();

  const isActive = profile?.subscription_status === "active";
  const freeUsed = profile?.free_pack_used === true;
  if (!isActive && freeUsed) {
    return NextResponse.json({ error: "FREE_LIMIT_REACHED" }, { status: 402 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const system = aiConfig.systemPrompt;
  const userPrompt = `
Voici le JSON d'entrée conforme à requestSchema:
${JSON.stringify(input, null, 2)}

Consigne: Génère un JSON STRICTEMENT conforme à responseSchema (cv, cover_letter, messages, meta). Pas de texte hors JSON.`;

  const completion = await openai.chat.completions.create({
    model: aiConfig.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = completion.choices?.[0]?.message?.content || "";
  let json: any;
  try {
    json = JSON.parse(content);
  } catch {
    json = {
      cv: {
        summary: "CV en cours de génération...",
        header: { fullName: input.fullName || "", targetTitle: input.targetTitle || "" },
        education: [],
        experience: [],
        projects: [],
        skills: { hardSkills: [], softSkills: [], tools: [] },
        languages: [],
      },
      cover_letter: {
        fullText: "Lettre de motivation en cours de génération...",
        paragraphs: [],
      },
      messages: {
        linkedin: "Message LinkedIn en cours de génération...",
        email: "Message email en cours de génération...",
      },
      meta: {},
    };
  }

  if (!isActive && !freeUsed) {
    await supabase.from("profiles").update({ free_pack_used: true }).eq("id", user.id);
  }

  // Enregistrer la génération avec la nouvelle structure
  await supabase.from("generations").insert({
    user_id: user.id,
    target_job_title: input.jobTitle || input.targetJobTitle,
    company_name: input.companyName || "",
    plan: isActive ? "pro" : "free",
    cv_content: JSON.stringify(json.cv || {}),
    cover_letter_content: json.cover_letter?.fullText || "",
    message_content: JSON.stringify(json.messages || {}),
  });

  return NextResponse.json(json);
}

