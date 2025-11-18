import { createServerClient } from "@supabase/ssr";
import type { cookies as cookiesType, headers as headersType } from "next/headers";

export function getSupabaseServer() {
  // Lazy require to avoid edge/runtime issues
  const cookies = require("next/headers").cookies as typeof cookiesType;
  const headers = require("next/headers").headers as typeof headersType;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies().set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookies().set({ name, value: "", ...options });
        },
      },
      headers,
    }
  );
}



