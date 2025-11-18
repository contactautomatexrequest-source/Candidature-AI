"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export function CheckoutButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const onCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userEmail) {
        console.info("[checkout] not logged in → redirect to /compte");
        window.location.assign("/compte?next=/compte");
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



