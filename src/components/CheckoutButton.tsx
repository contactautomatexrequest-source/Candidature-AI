"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

export function CheckoutButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthMessage, setShowAuthMessage] = useState(false);

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
        setError("Impossible d’ouvrir le paiement. Réessaie.");
        console.error("Stripe checkout error", res.status, msg);
        if (typeof window !== "undefined") {
          alert("Échec de l’ouverture du paiement. Réessaie dans quelques secondes.");
        }
        return;
      }
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};
      if (data?.url) {
        console.info("[checkout] redirecting to Stripe", data.url);
        window.location.assign(data.url as string);
      } else {
        setError("Lien de paiement indisponible pour le moment.");
        console.error("Stripe checkout missing url", data);
        if (typeof window !== "undefined") {
          alert("Lien de paiement indisponible pour le moment.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (showAuthMessage) {
    return (
      <div className="mt-3 space-y-3">
        <p className="text-xs text-slate-700">
          Connecte-toi ou crée un compte pour passer en premium.
        </p>
        <div className="flex gap-2">
          <Link
            href="/compte?mode=signup"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Créer un compte
          </Link>
          <Link
            href="/compte"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
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
        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Redirection..." : "Passer en premium"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}



