"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

export function CheckoutButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowAuthMessage(false);
      if (!userEmail) {
        setShowAuthMessage(true);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.warn("[checkout] 401 → redirect to /compte");
          window.location.assign("/compte?next=/compte");
          return;
        }
        const msg = await res.text().catch(() => "");
        const errorMsg = "Impossible d'ouvrir le paiement. Réessaie.";
        setError(errorMsg);
        showToast(errorMsg, "error");
        console.error("Stripe checkout error", res.status, msg);
        return;
      }
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};
      if (data?.url) {
        console.info("[checkout] redirecting to Stripe", data.url);
        showToast("Redirection vers Stripe...", "info");
        window.location.assign(data.url as string);
      } else {
        const errorMsg = "Lien de paiement indisponible pour le moment.";
        setError(errorMsg);
        showToast(errorMsg, "error");
        console.error("Stripe checkout missing url", data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showAuthMessage) {
    return (
      <div className="mt-3 space-y-3 animate-fade-in">
        <p className="text-xs text-slate-700">
          Connecte-toi ou crée un compte pour passer en premium.
        </p>
        <div className="flex gap-2">
          <Link
            href="/compte?mode=signup"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 hover-lift"
          >
            Créer un compte
          </Link>
          <Link
            href="/compte"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 hover-lift"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={onCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {loading ? "Redirection..." : "Passer en premium"}
      </button>
      {error && (
        <div className="animate-fade-in mt-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}



