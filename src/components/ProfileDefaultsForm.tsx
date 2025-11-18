"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type EducationEntry = { degree: string; school: string; dates: string; projects: string };
type ExperienceEntry = { role: string; company: string; dates: string; missionsResults: string };
type ProjectEntry = { name: string; description: string };

export function ProfileDefaultsForm() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    headline: "",
    location: "",
    objectiveShort: "",
    educationEntries: [{ degree: "", school: "", dates: "", projects: "" }] as EducationEntry[],
    experienceEntries: [{ role: "", company: "", dates: "", missionsResults: "" }] as ExperienceEntry[],
    projectEntries: [{ name: "", description: "" }] as ProjectEntry[],
    skillsTech: [""],
    skillsSoft: [""],
    languages: [""],
    software: [""],
    tonePreference: "",
    constraints: "",
  });

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
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

  const updateField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateList =
    (key: "skillsTech" | "skillsSoft" | "languages" | "software", idx: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => {
        const arr = [...(f[key] as string[])];
        arr[idx] = e.target.value;
        return { ...f, [key]: arr };
      });
  const addToList = (key: "skillsTech" | "skillsSoft" | "languages" | "software") =>
    setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), ""] }));
  const removeFromList = (key: "skillsTech" | "skillsSoft" | "languages" | "software", idx: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] as string[]).filter((_, i) => i !== idx) }));

  const updateEducation = (idx: number, key: keyof EducationEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.educationEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, educationEntries: next };
    });
  const addEducation = () =>
    setForm((f) => ({ ...f, educationEntries: [...f.educationEntries, { degree: "", school: "", dates: "", projects: "" }] }));
  const removeEducation = (idx: number) =>
    setForm((f) => ({ ...f, educationEntries: f.educationEntries.filter((_, i) => i !== idx) }));

  const updateExperience = (idx: number, key: keyof ExperienceEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.experienceEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, experienceEntries: next };
    });
  const addExperience = () =>
    setForm((f) => ({ ...f, experienceEntries: [...f.experienceEntries, { role: "", company: "", dates: "", missionsResults: "" }] }));
  const removeExperience = (idx: number) =>
    setForm((f) => ({ ...f, experienceEntries: f.experienceEntries.filter((_, i) => i !== idx) }));

  const updateProject = (idx: number, key: keyof ProjectEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => {
      const next = [...f.projectEntries];
      next[idx] = { ...next[idx], [key]: e.target.value };
      return { ...f, projectEntries: next };
    });
  const addProject = () => setForm((f) => ({ ...f, projectEntries: [...f.projectEntries, { name: "", description: "" }] }));
  const removeProject = (idx: number) =>
    setForm((f) => ({ ...f, projectEntries: f.projectEntries.filter((_, i) => i !== idx) }));

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      if (!userEmail) return;
      setSaveStatus("saving");
      fetch("/api/save-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("idle"));
    }, 600);
    return () => clearTimeout(t);
  }, [form, userEmail]);

  if (!userEmail) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">Connecte-toi pour modifier tes informations par défaut.</p>
        <a href="/compte?mode=signin" className="mt-3 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Mes informations par défaut</p>

      {/* A. Profil */}
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Nom et prénom" value={form.fullName} onChange={updateField("fullName")} />
        <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Email" type="email" value={form.email} onChange={updateField("email")} />
        <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ville (optionnel)" value={form.location} onChange={updateField("location")} />
        <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Intitulé recherché" value={form.headline} onChange={updateField("headline")} />
        <input className="sm:col-span-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Objectif court (optionnel)" value={form.objectiveShort} onChange={updateField("objectiveShort")} />
      </div>

      {/* B. Formation */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Formations</p>
        {form.educationEntries.map((ed, idx) => (
          <div key={`edu-${idx}`} className="grid gap-3 sm:grid-cols-3">
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Diplôme" value={ed.degree} onChange={updateEducation(idx, "degree")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="École" value={ed.school} onChange={updateEducation(idx, "school")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Dates" value={ed.dates} onChange={updateEducation(idx, "dates")} />
            <textarea className="sm:col-span-3 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[90px]" placeholder="Projets marquants (optionnel)" value={ed.projects} onChange={updateEducation(idx, "projects")}></textarea>
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
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Expériences</p>
        {form.experienceEntries.map((ex, idx) => (
          <div key={`exp-${idx}`} className="grid gap-3 sm:grid-cols-3">
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Poste" value={ex.role} onChange={updateExperience(idx, "role")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Entreprise" value={ex.company} onChange={updateExperience(idx, "company")} />
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Dates" value={ex.dates} onChange={updateExperience(idx, "dates")} />
            <textarea className="sm:col-span-3 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]" placeholder="Missions et résultats" value={ex.missionsResults} onChange={updateExperience(idx, "missionsResults")}></textarea>
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

      {/* D. Projets */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Projets</p>
        {form.projectEntries.map((p, idx) => (
          <div key={`proj-${idx}`} className="grid gap-3">
            <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Nom du projet" value={p.name} onChange={updateProject(idx, "name")} />
            <textarea className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]" placeholder="Ce que tu as fait" value={p.description} onChange={updateProject(idx, "description")}></textarea>
            {form.projectEntries.length > 1 && (
              <button type="button" onClick={() => removeProject(idx)} className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                Retirer
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addProject()} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
          Ajouter un projet
        </button>
      </div>

      {/* E. Compétences */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Compétences</p>
        <div className="space-y-2">
          <p className="text-[11px] text-slate-600">Techniques</p>
          {form.skillsTech.map((val, idx) => (
            <div key={`tech-${idx}`} className="flex items-center gap-2">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: React, SQL..." value={val} onChange={updateList("skillsTech", idx)} />
              {form.skillsTech.length > 1 && (
                <button type="button" onClick={() => removeFromList("skillsTech", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addToList("skillsTech")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] text-slate-600">Humaines</p>
          {form.skillsSoft.map((val, idx) => (
            <div key={`soft-${idx}`} className="flex items-center gap-2">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Communication..." value={val} onChange={updateList("skillsSoft", idx)} />
              {form.skillsSoft.length > 1 && (
                <button type="button" onClick={() => removeFromList("skillsSoft", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addToList("skillsSoft")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] text-slate-600">Langues</p>
          {form.languages.map((val, idx) => (
            <div key={`lang-${idx}`} className="flex items-center gap-2">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Français C2, Anglais B2..." value={val} onChange={updateList("languages", idx)} />
              {form.languages.length > 1 && (
                <button type="button" onClick={() => removeFromList("languages", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addToList("languages")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] text-slate-600">Logiciels</p>
          {form.software.map((val, idx) => (
            <div key={`softw-${idx}`} className="flex items-center gap-2">
              <input className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Figma, Excel..." value={val} onChange={updateList("software", idx)} />
              {form.software.length > 1 && (
                <button type="button" onClick={() => removeFromList("software", idx)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs">
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addToList("software")} className="inline-flex w-fit items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </div>

      {/* G. Style + H. Détails optionnels */}
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" value={form.tonePreference} onChange={updateField("tonePreference")}>
          <option value="">Choisir un ton</option>
          <option value="professionnel">Professionnel</option>
          <option value="dynamique">Dynamique</option>
          <option value="convaincant">Convaincant</option>
          <option value="créatif">Créatif</option>
          <option value="sobre">Sobre</option>
        </select>
        <textarea className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[90px]" placeholder="Contrainte ou précision libre" value={form.constraints} onChange={updateField("constraints")}></textarea>
      </div>

      <div className="text-right">
        <span className="text-[11px] text-slate-500">
          {saveStatus === "saving" && "Enregistrement..."}
          {saveStatus === "saved" && "Enregistré"}
          {saveStatus === "idle" && ""}
        </span>
      </div>
    </div>
  );
}



