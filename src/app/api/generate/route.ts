import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { aiConfig } from "@/lib/ai/aiConfig";

// On accepte le payload complet défini par requestSchema; on valide faiblement
const InputSchema = z.record(z.any());

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
    max_tokens: 1200,
  });

  const content = completion.choices?.[0]?.message?.content || "";
  let json: any;
  try {
    json = JSON.parse(content);
  } catch {
    json = {
      cv_content: "Contenu CV",
      cover_letter_content: "Contenu lettre",
      message_content: "Contenu message",
    };
  }

  if (!isActive && !freeUsed) {
    await supabase.from("profiles").update({ free_pack_used: true }).eq("id", user.id);
  }

  await supabase.from("generations").insert({
    user_id: user.id,
    target_job_title: input.targetJobTitle,
    company_name: input.companyName,
    plan: isActive ? "pro" : "free",
    cv_content: json.cv_content ?? "",
    cover_letter_content: json.cover_letter_content ?? "",
    message_content: json.message_content ?? "",
  });

  return NextResponse.json(json);
}

import { NextRequest, NextResponse } from "next/server";
import { generateApplication } from "@/lib/aiClient";
import { createClient } from "@supabase/supabase-js";
import type {
  GenerateRequest,
  StructuredSubmission,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  LanguageItem,
} from "@/types/ai";

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

function isLegacyRequest(body: any): body is GenerateRequest {
  return (
    typeof body?.offerText === "string" &&
    typeof body?.candidateProfile === "string" &&
    typeof body?.jobType === "string"
  );
}

function isStructuredSubmission(body: any): body is StructuredSubmission {
  return (
    typeof body?.profile === "object" &&
    typeof body?.offer?.text === "string" &&
    typeof body?.jobTarget?.jobTitle === "string"
  );
}

function formatList(items: string[], title: string) {
  if (!items.length) return "";
  return `${title}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function formatEducation(items: EducationItem[]) {
  if (!items?.length) return "";
  return items
    .map((item) => {
      const duration =
        item.startYear || item.endYear
          ? ` (${item.startYear ?? "?"} - ${item.endYear ?? "?"})`
          : "";
      return `- ${item.degree || "Formation"}${item.school ? ` – ${item.school}` : ""}${duration}${
        item.details ? ` | ${item.details}` : ""
      }`;
    })
    .join("\n");
}

function formatExperiences(items: ExperienceItem[]) {
  if (!items?.length) return "";
  return items
    .map((item) => {
      const headerParts = [item.role, item.company].filter(Boolean).join(" – ");
      const typePart = item.experienceType ? ` (${item.experienceType})` : "";
      const datePart =
        item.startDate || item.endDate ? ` | ${item.startDate ?? "?"} → ${item.endDate ?? "?"}` : "";
      const missions = item.missions ? `\n  Missions : ${item.missions}` : "";
      const skills =
        item.experienceSkills && item.experienceSkills.length
          ? `\n  Compétences : ${item.experienceSkills.join(", ")}`
          : "";
      return `- ${headerParts || "Expérience"}${typePart}${datePart}${missions}${skills}`;
    })
    .join("\n");
}

function formatProjects(items: ProjectItem[]) {
  if (!items?.length) return "";
  return items
    .map((item) => {
      const header = [item.title, item.context].filter(Boolean).join(" – ");
      const desc = item.description ? `\n  Rôle : ${item.description}` : "";
      const skills =
        item.projectSkills && item.projectSkills.length
          ? `\n  Compétences : ${item.projectSkills.join(", ")}`
          : "";
      return `- ${header || "Projet"}${desc}${skills}`;
    })
    .join("\n");
}

function formatLanguages(items: LanguageItem[]) {
  if (!items?.length) return "";
  return items
    .map((item) => `${item.languageName ?? "Langue"}${item.languageLevel ? ` (${item.languageLevel})` : ""}`)
    .join(", ");
}

function transformStructuredSubmission(body: StructuredSubmission): GenerateRequest {
  const sections: string[] = [];
  const { profile, education, experiences, projects, skills, jobTarget, offer } = body;

  sections.push(`Nom complet : ${profile.firstName} ${profile.lastName}`);
  const contacts = [
    profile.email && `Email : ${profile.email}`,
    profile.phone && `Tel : ${profile.phone}`,
    profile.city && `Ville : ${profile.city}`,
    typeof profile.age === "number" && !Number.isNaN(profile.age) ? `Âge : ${profile.age}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  if (contacts) {
    sections.push(contacts);
  }
  sections.push(`Titre CV : ${profile.headline}`);
  if (profile.shortIntro) {
    sections.push(`Présentation : ${profile.shortIntro}`);
  }

  sections.push(`Niveau d'études : ${education.educationLevel}`);
  const educationBlock = formatEducation(education.educationItems);
  if (educationBlock) {
    sections.push(`Formations :\n${educationBlock}`);
  }

  if (experiences.hasExperience === "yes") {
    const experiencesBlock = formatExperiences(experiences.experienceItems);
    if (experiencesBlock) {
      sections.push(`Expériences professionnelles :\n${experiencesBlock}`);
    }
  }

  const projectsBlock = formatProjects(projects.projectItems);
  if (projectsBlock) {
    sections.push(`Projets :\n${projectsBlock}`);
  }

  if (skills.technicalSkills.length) {
    sections.push(`Compétences techniques : ${skills.technicalSkills.join(", ")}`);
  }
  if (skills.softSkills.length) {
    sections.push(`Qualités : ${skills.softSkills.join(", ")}`);
  }
  const languageBlock = formatLanguages(skills.languages);
  if (languageBlock) {
    sections.push(`Langues : ${languageBlock}`);
  }

  sections.push(`Poste visé : ${jobTarget.jobTitle}`);
  if (jobTarget.availability) {
    sections.push(`Disponibilité : ${jobTarget.availability}`);
  }
  if (offer.title || offer.url) {
    sections.push(
      `Offre ciblée : ${offer.title ?? "Annonce"}${offer.url ? ` – ${offer.url}` : ""}`
    );
  }

  const candidateProfile = sections.filter(Boolean).join("\n\n");

  return {
    offerText: offer.text?.trim() ?? "",
    candidateProfile,
    jobType: jobTarget.jobTitle?.trim() ?? "",
    tonePreference: jobTarget.tonePreference ?? "standard",
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    // Auth Supabase via Bearer
    const jwt = getBearerToken(request);
    if (!jwt) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supa = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await supa.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Utilisateur invalide." }, { status: 401 });
    }
    const userId = userData.user.id;

    let payload: GenerateRequest;

    if (isLegacyRequest(rawBody)) {
      payload = rawBody;
    } else if (isStructuredSubmission(rawBody)) {
      payload = transformStructuredSubmission(rawBody);
    } else {
      return NextResponse.json(
        { error: "Format de requête invalide." },
        { status: 400 }
      );
    }

    // Validation
    if (
      !payload.offerText ||
      !payload.candidateProfile ||
      !payload.jobType ||
      payload.offerText.trim().length < 50 ||
      payload.candidateProfile.trim().length < 30
    ) {
      return NextResponse.json(
        { error: "Merci de remplir correctement tous les champs demandés." },
        { status: 400 }
      );
    }

    // Vérifier profil et statut d’abonnement
    const { data: profile, error: profileErr } = await supa
      .from("profiles")
      .select("id, subscription_status, free_pack_used")
      .eq("id", userId)
      .single();
    if (profileErr) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    const isPaid = profile.subscription_status === "active";
    if (!isPaid && profile.free_pack_used) {
      return NextResponse.json(
        { error: "free_limit_reached" },
        { status: 403 }
      );
    }

    const result = await generateApplication(payload);

    // Enregistrer la génération
    const plan = isPaid ? "paid" : "free";
    const insertRes = await supa
      .from("generations")
      .insert({
        user_id: userId,
        target_job_title: payload.jobType,
        company_name: null,
        plan,
        cv_content: result.cv,
        cover_letter_content: result.letter,
        message_content: result.message,
      })
      .select("id")
      .single();

    if (!isPaid) {
      // Marquer l’usage du pack gratuit
      await supa
        .from("profiles")
        .update({ free_pack_used: true })
        .eq("id", userId);
    }

    return NextResponse.json({
      ...result,
      plan,
      has_watermark: !isPaid,
      generation_id: insertRes.data?.id ?? null,
    });
  } catch (error) {
    console.error("Error generating application:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans quelques instants." },
      { status: 500 }
    );
  }
}

