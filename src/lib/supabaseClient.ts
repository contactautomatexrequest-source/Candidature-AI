"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si on est dans le navigateur et que les variables sont définies, utiliser les vraies valeurs
  if (typeof window !== "undefined" && url && key) {
    return createClient(url, key);
  }
  
  // Pendant le build (SSR), créer un client factice qui ne sera jamais utilisé
  // Utiliser des valeurs qui passent la validation de format mais ne sont pas réelles
  const buildUrl = url || "https://build-placeholder.supabase.co";
  const buildKey = key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aWxkLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODkyMDAsImV4cCI6MTk2MTM2NTIwMH0.build";
  
  return createClient(buildUrl, buildKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Lazy initialization - le client n'est créé que quand il est utilisé
export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createSupabaseClient();
    }
    const value = _supabaseClient[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return value.bind(_supabaseClient);
    }
    return value;
  },
});



