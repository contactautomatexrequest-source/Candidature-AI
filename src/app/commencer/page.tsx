"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function CommencerPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [tab, setTab] = useState<"cv" | "letter" | "message">("cv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    headline: "",
    location: "",
    objectiveShort: "",
    educationEntries: [
      { degree: "", school: "", dates: "", projects: "" },
    ] as Array<{ degree: string; school: string; dates: string; projects: string }>,
    experienceEntries: [
      { role: "", company: "", dates: "", missionsResults: "" },
    ] as Array<{ role: string; company: string; dates: string; missionsResults: string }>,
    projectEntries: [
      { name: "", description: "" },
    ] as Array<{ name: string; description: string }>,
    skillsTech: [""],
    skillsSoft: [""],
    languages: [""],
    software: [""],
    targetJobTitle: "",
    companyName: "",
    jobDescription: "",
    tonePreference: "",
    constraints: "",
  });
  const [results, setResults] = useState<{
    cv?: any;
    cover_letter?: any;
    messages?: { linkedin?: string; email?: string };
    cv_content?: string;
    cover_letter_content?: string;
    message_content?: string;
  } | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(async ({ data }) => {
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("subscription_status")
          .eq("id", data.user.id)
          .single();
        setSubscriptionStatus(profile?.subscription_status || "free");
      }
    });
  }, []);

  // Prefill depuis defaults
  useEffect(() => {
    (async () => {
      if (!userEmail) return;
      const res = await fetch("/api/save-defaults", { method: "GET" });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        setForm((prev) => ({
          ...prev,
          ...json.data,
          // préserver structures si absentes
          educationEntries: json.data.educationEntries ?? prev.educationEntries,
          experienceEntries: json.data.experienceEntries ?? prev.experienceEntries,
          projectEntries: json.data.projectEntries ?? prev.projectEntries,
          skillsTech: json.data.skillsTech ?? prev.skillsTech,
          skillsSoft: json.data.skillsSoft ?? prev.skillsSoft,
          languages: json.data.languages ?? prev.languages,
          software: json.data.software ?? prev.software,
        }));
      }
    })();
  }, [userEmail]);

  // Autosave (sauf offre)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!userEmail) return;
      const { targetJobTitle, companyName, jobDescription, ...rest } = form;
      setSaveStatus("saving");
      fetch("/api/save-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("idle"));
    }, 600);
    return () => clearTimeout(handler);
  }, [form, userEmail]);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  // Helpers pour listes dynamiques
  const addEducation = () =>
    setForm((f) => ({ ...f, educationEntries: [...f.educationEntries, { degree: "", school: "", dates: "", projects: "" }] }));
  const updateEducation = (idx: number, key: "degree" | "school" | "dates" | "projects") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.educationEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, educationEntries: next };
    });
  const removeEducation = (idx: number) =>
    setForm((f) => ({ ...f, educationEntries: f.educationEntries.filter((_, i) => i !== idx) }));

  const addExperience = () =>
    setForm((f) => ({ ...f, experienceEntries: [...f.experienceEntries, { role: "", company: "", dates: "", missionsResults: "" }] }));
  const updateExperience = (idx: number, key: "role" | "company" | "dates" | "missionsResults") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.experienceEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, experienceEntries: next };
    });
  const removeExperience = (idx: number) =>
    setForm((f) => ({ ...f, experienceEntries: f.experienceEntries.filter((_, i) => i !== idx) }));

  const addProject = () => setForm((f) => ({ ...f, projectEntries: [...f.projectEntries, { name: "", description: "" }] }));
  const updateProject = (idx: number, key: "name" | "description") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.projectEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, projectEntries: next };
    });
  const removeProject = (idx: number) =>
    setForm((f) => ({ ...f, projectEntries: f.projectEntries.filter((_, i) => i !== idx) }));

  const updateStringList =
    (key: "skillsTech" | "skillsSoft" | "languages" | "software", idx: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => {
        const arr = [...(f[key] as string[])];
        arr[idx] = e.target.value;
        return { ...f, [key]: arr } as typeof form;
      });
  const addStringList = (key: "skillsTech" | "skillsSoft" | "languages" | "software") =>
    setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), ""] } as typeof form));
  const removeStringList = (key: "skillsTech" | "skillsSoft" | "languages" | "software", idx: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] as string[]).filter((_, i) => i !== idx) } as typeof form));

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      if (!userEmail) {
        window.location.href = "/compte?next=/commencer";
        return;
      }
      // Construire le payload complet conforme à requestSchema
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: "", // champ non demandé dans ce formulaire
        city: form.location,
        mobility: "",
        photoPreference: "",
        targetTitle: form.headline,
        shortObjective: form.objectiveShort,
        educationEntries: form.educationEntries.map((e) => ({
          degree: e.degree,
          school: e.school,
          location: "",
          startDate: "",
          endDate: "",
          details: e.projects,
        })),
        experienceEntries: form.experienceEntries.map((e) => ({
          title: e.role,
          company: e.company,
          location: "",
          startDate: "",
          endDate: "",
          missions: e.missionsResults ? e.missionsResults.split("\n").filter(Boolean) : [],
          results: [],
        })),
        projectEntries: form.projectEntries.map((p) => ({
          name: p.name,
          context: "",
          whatWasDone: p.description,
        })),
        hardSkills: form.skillsTech.filter(Boolean),
        softSkills: form.skillsSoft.filter(Boolean),
        languages: form.languages.filter(Boolean).map((l) => ({ name: l, level: "" })),
        tools: form.software.filter(Boolean),
        jobTitle: form.targetJobTitle,
        companyName: form.companyName,
        jobDescriptionRaw: form.jobDescription,
        jobKeySkills: [],
        tonePreference: form.tonePreference,
        constraints: form.constraints,
        cvDesignPreference: "",
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "FREE_LIMIT_REACHED") {
          setError("Limite atteinte sur le plan gratuit. Passe en premium pour continuer.");
        } else if (res.status === 401) {
          setError("Connecte-toi pour générer ta candidature.");
        } else {
          setError("Une erreur est survenue.");
        }
        return;
      }
      setResults(data);
    } catch (e: any) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const onDownloadPdf = async () => {
    if (!results || !userEmail) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: results, type: tab }),
      });
      if (!res.ok) {
        setError("Erreur lors de la génération du PDF.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `candidature-${tab}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError("Erreur lors du téléchargement.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1.4fr)] lg:px-8 lg:py-14">
      <section className="rounded-2xl bg-slate-900 p-6 text-slate-50 space-y-3">
        <h1 className="text-xl font-semibold text-blue-600">Dis-nous l’essentiel, on s’occupe du reste.</h1>
        <p className="text-sm opacity-90">Formulaire pensé pour tenir en moins de 2 minutes. Tu peux tout modifier avant de télécharger.</p>
        <ul className="mt-2 space-y-1 text-sm opacity-90">
          <li>• Optimisé pour étudiants et débutants.</li>
          <li>• Résultat visible avant paiement.</li>
          <li>• Export PDF en 1 clic.</li>
        </ul>
      </section>
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!userEmail && (
          <div className="upsell-bar">
            <span className="text-black">Connecte-toi depuis “Mon compte” pour générer ta candidature.</span>
            <a href="/compte" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
              Se connecter
            </a>
            <a href="/compte?mode=signup" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
              S’inscrire
            </a>
          </div>
        )}
        {/* A. Profil */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">A. Profil</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Nom et prénom" value={form.fullName} onChange={update("fullName")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Email" type="email" value={form.email} onChange={update("email")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ville (optionnel)" value={form.location} onChange={update("location")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Intitulé recherché" value={form.headline} onChange={update("headline")} />
            <input className="sm:col-span-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Objectif court (optionnel)" value={form.objectiveShort} onChange={update("objectiveShort")} />
          </div>
        </div>
        {/* B. Formation */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">B. Formation</p>
          {form.educationEntries.map((ed, idx) => (
            <div key={`edu-${idx}`} className="grid gap-3 sm:grid-cols-3">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Diplôme" value={ed.degree} onChange={updateEducation(idx, "degree")} />
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="École" value={ed.school} onChange={updateEducation(idx, "school")} />
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Dates" value={ed.dates} onChange={updateEducation(idx, "dates")} />
              <textarea className="sm:col-span-3 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[90px]" placeholder="Projets marquants (optionnel)" value={ed.projects} onChange={updateEducation(idx, "projects")}></textarea>
              {form.educationEntries.length > 1 && (
                <button type="button" onClick={() => removeEducation(idx)} className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addEducation} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter une formation
          </button>
        </div>
        {/* C. Expériences */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">C. Expériences</p>
          {form.experienceEntries.map((ex, idx) => (
            <div key={`exp-${idx}`} className="grid gap-3 sm:grid-cols-3">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Poste" value={ex.role} onChange={updateExperience(idx, "role")} />
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Entreprise" value={ex.company} onChange={updateExperience(idx, "company")} />
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Dates" value={ex.dates} onChange={updateExperience(idx, "dates")} />
              <textarea className="sm:col-span-3 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]" placeholder="Missions et résultats" value={ex.missionsResults} onChange={updateExperience(idx, "missionsResults")}></textarea>
              {form.experienceEntries.length > 1 && (
                <button type="button" onClick={() => removeExperience(idx)} className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addExperience} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter une expérience
          </button>
        </div>
        {/* D. Projets personnels / scolaires */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">D. Projets personnels / scolaires</p>
          {form.projectEntries.map((p, idx) => (
            <div key={`proj-${idx}`} className="grid gap-3">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Nom du projet" value={p.name} onChange={updateProject(idx, "name")} />
              <textarea className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[120px]" placeholder="Ce que tu as fait" value={p.description} onChange={updateProject(idx, "description")}></textarea>
              {form.projectEntries.length > 1 && (
                <button type="button" onClick={() => removeProject(idx)} className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addProject} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter un projet
          </button>
        </div>
        {/* E. Compétences */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">E. Compétences</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Techniques</p>
              {form.skillsTech.map((val, idx) => (
                <div key={`tech-${idx}`} className="flex items-center gap-2 mb-2">
                  <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: React, SQL..." value={val} onChange={updateStringList("skillsTech", idx)} />
                  {form.skillsTech.length > 1 && (
                    <button type="button" onClick={() => removeStringList("skillsTech", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                      Retirer
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addStringList("skillsTech")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
                Ajouter
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Humaines</p>
              {form.skillsSoft.map((val, idx) => (
                <div key={`soft-${idx}`} className="flex items-center gap-2 mb-2">
                  <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Communication, Esprit d’équipe..." value={val} onChange={updateStringList("skillsSoft", idx)} />
                  {form.skillsSoft.length > 1 && (
                    <button type="button" onClick={() => removeStringList("skillsSoft", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                      Retirer
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addStringList("skillsSoft")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
                Ajouter
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Langues</p>
              {form.languages.map((val, idx) => (
                <div key={`lang-${idx}`} className="flex items-center gap-2 mb-2">
                  <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Français C2, Anglais B2..." value={val} onChange={updateStringList("languages", idx)} />
                  {form.languages.length > 1 && (
                    <button type="button" onClick={() => removeStringList("languages", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                      Retirer
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addStringList("languages")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
                Ajouter
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Logiciels</p>
              {form.software.map((val, idx) => (
                <div key={`softw-${idx}`} className="flex items-center gap-2 mb-2">
                  <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Figma, Excel..." value={val} onChange={updateStringList("software", idx)} />
                  {form.software.length > 1 && (
                    <button type="button" onClick={() => removeStringList("software", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                      Retirer
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addStringList("software")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
                Ajouter
              </button>
            </div>
          </div>
        </div>
        {/* F. Offre visée */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">F. Offre visée</p>
          <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Poste visé" value={form.targetJobTitle} onChange={update("targetJobTitle")} />
          <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Entreprise (optionnel)" value={form.companyName} onChange={update("companyName")} />
          <textarea className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[140px]" placeholder="Description de l’offre (coller le texte)" value={form.jobDescription} onChange={update("jobDescription")}></textarea>
        </div>
        {/* G. Style */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">G. Style</p>
          <select className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" value={form.tonePreference} onChange={(e) => setForm((f) => ({ ...f, tonePreference: e.target.value }))}>
            <option value="">Choisir un ton</option>
            <option value="professionnel">Professionnel</option>
            <option value="dynamique">Dynamique</option>
            <option value="convaincant">Convaincant</option>
            <option value="créatif">Créatif</option>
            <option value="sobre">Sobre</option>
          </select>
        </div>
        {/* H. Détails optionnels */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900">H. Détails optionnels</p>
          <textarea className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]" placeholder="Contrainte ou précision libre" value={form.constraints} onChange={update("constraints")}></textarea>
        </div>
        <button disabled={loading} onClick={onGenerate} className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Génération en cours..." : userEmail ? "Générer mon CV, ma lettre et mon message" : "Créer un compte pour générer"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="mt-6 space-y-4">
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
            <button onClick={() => setTab("cv")} className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition ${tab === "cv" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>CV</button>
            <button onClick={() => setTab("letter")} className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition ${tab === "letter" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Lettre de motivation</button>
            <button onClick={() => setTab("message")} className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition ${tab === "message" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>Message</button>
          </div>
          {subscriptionStatus !== "active" && (
            <p className="text-xs text-slate-600">Pour la version gratuite, le PDF inclut un watermark.</p>
          )}
          {results && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-600">Résultat généré</span>
                {tab === "cv" && results.cv && (
                  <button
                    onClick={onDownloadPdf}
                    disabled={pdfLoading}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {pdfLoading ? "Génération..." : "Télécharger en PDF"}
                  </button>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 whitespace-pre-wrap">
                {tab === "cv" && (results.cv?.summary || results.cv_content || "—")}
                {tab === "letter" && (results.cover_letter?.fullText || results.cover_letter_content || "—")}
                {tab === "message" && (
                  <div>
                    <p className="font-semibold mb-2">LinkedIn:</p>
                    <p className="mb-4">{results.messages?.linkedin || results.message_content || "—"}</p>
                    <p className="font-semibold mb-2">Email:</p>
                    <p>{results.messages?.email || "—"}</p>
                  </div>
                )}
              </div>
            </>
          )}
          {userEmail && (
            <div className="text-right">
              <span className="text-[11px] text-slate-500">
                {saveStatus === "saving" && "Enregistrement..."}
                {saveStatus === "saved" && "Enregistré"}
                {saveStatus === "idle" && ""}
              </span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


