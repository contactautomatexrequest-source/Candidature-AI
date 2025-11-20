import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    // Pendant le build, créer un client factice avec une URL qui passe la validation
    // mais qui ne sera jamais utilisé car les routes API ne sont pas exécutées pendant le build
    return createClient(
      "https://build-placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aWxkLXBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTc4OTIwMCwiZXhwIjoxOTYxMzY1MjAwfQ.build",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  
  return createClient(url, key);
}

// Lazy initialization - le client n'est créé que quand il est utilisé
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createSupabaseAdmin();
    }
    const value = _supabaseAdmin[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return value.bind(_supabaseAdmin);
    }
    return value;
  },
});



