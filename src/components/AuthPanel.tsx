"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/ToastProvider";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  // Active le mode "signup" si l'URL contient ?mode=signup
  // Affiche les messages de succès/erreur depuis l'URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") {
        setMode("signup");
      }
      const message = params.get("message");
      const errorParam = params.get("error");
      if (message) {
        showToast(message, "success");
        setSuccess(message);
        setError(null);
        // Nettoyer l'URL
        window.history.replaceState({}, "", window.location.pathname);
      }
      if (errorParam) {
        showToast(errorParam, "error");
        setError(errorParam);
        setSuccess(null);
        // Nettoyer l'URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast("Vous êtes bien connecté", "success");
        setSuccess("Vous êtes bien connecté");
        setError(null);
      } else {
        // Toujours utiliser l'URL de production pour les emails de confirmation
        // Les emails sont toujours envoyés depuis le serveur de production
        const redirectTo = "https://candidatureai.netlify.app/auth/callback";
        const { error, data } = await supabaseClient.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          // Email de confirmation envoyé
          setError(null);
          const msg = "Un email de confirmation a été envoyé. Clique sur le lien dans l'email pour confirmer ton compte.";
          showToast(msg, "info");
          setSuccess(msg);
          return;
        }
        // Si une session est créée directement (email confirmé automatiquement)
        if (data.session) {
          showToast("Compte créé", "success");
          setSuccess("Compte créé");
          setError(null);
        }
      }
      const { data } = await supabaseClient.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    } catch (e: any) {
      const errorMsg = e?.message ?? "Erreur";
      showToast(errorMsg, "error");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSignOut = async () => {
    await supabaseClient.auth.signOut();
    setUserEmail(null);
  };

  if (userEmail) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">Connecté en tant que <span className="font-semibold">{userEmail}</span></p>
        <div className="mt-4 flex gap-3">
          <a href="/commencer" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            Accéder au générateur
          </a>
          <button onClick={onSignOut} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{mode === "signin" ? "Se connecter" : "Créer un compte"}</p>
        <button className="text-xs text-blue-600" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        <input
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-green-600">{success}</p>}
        <button
          disabled={loading}
          onClick={onSubmit}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}


