"use client";
import { useEffect, useState } from "react";

type DebugState = {
  auth: { isAuthenticated: boolean; error?: string };
  env: Record<string, boolean>;
  supabase: { ok: boolean; error?: string };
  openai: { ok: boolean; error?: string };
};

export default function DebugPage() {
  const [state, setState] = useState<DebugState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/debug", { cache: "no-store" });
        const json = await res.json();
        setState(json);
      } catch (e: any) {
        setError(e?.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-blue-600">Debug – État de l’application</h1>
      {loading && <p className="mt-4 text-sm text-slate-700">Chargement…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {state && (
        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Authentification</p>
            <p className="mt-2 text-sm">
              Statut:{" "}
              <span className={state.auth.isAuthenticated ? "text-green-600" : "text-red-600"}>
                {state.auth.isAuthenticated ? "connecté" : "non connecté"}
              </span>
            </p>
            {state.auth.error && <p className="text-xs text-red-600 mt-1">{state.auth.error}</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Variables d’environnement</p>
            <ul className="mt-2 grid grid-cols-1 gap-2 text-sm">
              {Object.entries(state.env).map(([key, ok]) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="text-slate-700">{key}</span>
                  <span className={ok ? "text-green-600" : "text-red-600"}>{ok ? "OK" : "Manquante"}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Supabase</p>
            <p className="mt-2 text-sm">
              Ping: <span className={state.supabase.ok ? "text-green-600" : "text-red-600"}>{state.supabase.ok ? "OK" : "Échec"}</span>
            </p>
            {state.supabase.error && <p className="text-xs text-red-600 mt-1">{state.supabase.error}</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">OpenAI</p>
            <p className="mt-2 text-sm">
              Ping: <span className={state.openai.ok ? "text-green-600" : "text-red-600"}>{state.openai.ok ? "OK" : "Échec"}</span>
            </p>
            {state.openai.error && <p className="text-xs text-red-600 mt-1">{state.openai.error}</p>}
          </section>
        </div>
      )}
    </main>
  );
}


