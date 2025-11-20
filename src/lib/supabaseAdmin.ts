import { createClient } from "@supabase/supabase-js";

// Utilisation de valeurs par défaut valides pendant le build
// Le vrai client sera utilisé au runtime avec les vraies variables d'environnement
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});



