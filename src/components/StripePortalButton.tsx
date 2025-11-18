"use client";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export function StripePortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) {
        window.location.href = "/compte?next=/compte";
        return;
      }

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "NO_CUSTOMER") {
          setError("Aucun abonnement actif.");
        } else {
          setError("Erreur lors de l'ouverture du portail.");
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? "Chargement..." : "Gérer mon abonnement"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

