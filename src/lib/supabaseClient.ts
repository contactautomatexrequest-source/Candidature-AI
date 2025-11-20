"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  // Toujours utiliser les variables d'environnement côté client
  // Next.js expose NEXT_PUBLIC_* automatiquement côté client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si on est dans le navigateur, on doit avoir les vraies valeurs
  if (typeof window !== "undefined") {
    if (!url || !key) {
      console.error("Supabase credentials are missing:", {
        hasUrl: !!url,
        hasKey: !!key,
        urlLength: url?.length || 0,
        keyLength: key?.length || 0,
      });
      // Créer un client avec des valeurs factices qui échoueront clairement
      // Cela permettra d'afficher un message d'erreur plus clair
      const placeholderUrl = "https://missing-config.supabase.co";
      const placeholderKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3NpbmctY29uZmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODkyMDAsImV4cCI6MTk2MTM2NTIwMH0.placeholder";
      return createClient(placeholderUrl, placeholderKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
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
    try {
      if (!_supabaseClient) {
        _supabaseClient = createSupabaseClient();
      }
      const value = _supabaseClient[prop as keyof SupabaseClient];
      if (typeof value === "function") {
        return value.bind(_supabaseClient);
      }
      return value;
    } catch (error) {
      console.error("Error accessing Supabase client:", error);
      throw error;
    }
  },
});



