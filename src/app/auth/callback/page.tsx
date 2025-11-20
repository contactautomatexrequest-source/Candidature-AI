"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(errorDescription || error || "Une erreur est survenue lors de la confirmation.");
          return;
        }

        // Supabase gère automatiquement les hash tokens dans l'URL
        // Il suffit d'appeler getSession() après la redirection
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          setStatus("error");
          setMessage(sessionError.message || "Le lien de confirmation est invalide ou a expiré.");
          return;
        }

        if (session) {
          setStatus("success");
          setMessage("Ton compte a été confirmé avec succès !");
          // Rediriger vers la page de compte après 2 secondes
          setTimeout(() => {
            router.push("/compte");
          }, 2000);
        } else {
          // Essayer de vérifier avec le hash token
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          
          if (accessToken && refreshToken) {
            const { data: { session: newSession }, error: tokenError } = await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (tokenError || !newSession) {
              setStatus("error");
              setMessage("Le lien de confirmation est invalide ou a expiré.");
              return;
            }
            
            setStatus("success");
            setMessage("Ton compte a été confirmé avec succès !");
            setTimeout(() => {
              router.push("/compte");
            }, 2000);
          } else {
            setStatus("error");
            setMessage("Session introuvable. Réessaie de te connecter.");
          }
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Une erreur inattendue est survenue.");
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <main className="mx-auto max-w-5xl px-4 lg:px-8 py-10 lg:py-14">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        {status === "loading" && (
          <>
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <p className="text-sm text-slate-700">Vérification de ton compte...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-2">Confirmation réussie !</h1>
            <p className="text-sm text-slate-700 mb-4">{message}</p>
            <p className="text-xs text-slate-500">Redirection en cours...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-2">Erreur de confirmation</h1>
            <p className="text-sm text-slate-700 mb-4">{message}</p>
            <div className="flex gap-3 justify-center">
              <a
                href="/compte"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Aller à la page de connexion
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

