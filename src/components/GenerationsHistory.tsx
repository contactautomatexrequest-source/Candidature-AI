"use client";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

interface Generation {
  id: string;
  target_job_title: string | null;
  company_name: string | null;
  created_at: string;
  cv_content: string | null;
  cover_letter_content: string | null;
  message_content: string | null;
}

export function GenerationsHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        loadGenerations(data.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadGenerations = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setGenerations(data || []);
    } catch (e: any) {
      console.error("Error loading generations:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!userEmail) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
        Connecte-toi pour voir ton historique.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
        Chargement...
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
        Aucun élément pour le moment.
      </div>
    );
  }

  return (
    <div className="mt-4 w-full text-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Date</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Poste</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Entreprise</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {generations.map((gen) => (
              <tr key={gen.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-3 text-slate-700">{formatDate(gen.created_at)}</td>
                <td className="py-3 px-3 text-slate-700">{gen.target_job_title || "—"}</td>
                <td className="py-3 px-3 text-slate-700">{gen.company_name || "—"}</td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/commencer?reuse=${gen.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

