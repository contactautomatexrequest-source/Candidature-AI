import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Gérer les paramètres dans l'URL (query params)
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const type = requestUrl.searchParams.get("type");

  // Gérer aussi les hash tokens (Supabase peut utiliser #access_token=...)
  const hash = requestUrl.hash;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    accessToken = hashParams.get("access_token");
    refreshToken = hashParams.get("refresh_token");
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/compte?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  const cookieStore = cookies() as any;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );

  // Si on a un code, l'échanger contre une session
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/compte?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    return NextResponse.redirect(new URL("/compte?message=Compte créé avec succès", requestUrl.origin));
  }

  // Si on a des tokens dans le hash, les utiliser directement
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return NextResponse.redirect(
        new URL(`/compte?error=${encodeURIComponent(sessionError.message)}`, requestUrl.origin)
      );
    }

    return NextResponse.redirect(new URL("/compte?message=Compte créé avec succès", requestUrl.origin));
  }

  // Si pas de code ni de token, vérifier si on a déjà une session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return NextResponse.redirect(new URL("/compte?message=Vous êtes bien connecté", requestUrl.origin));
  }

  // Sinon, rediriger vers la page de compte
  return NextResponse.redirect(new URL("/compte", requestUrl.origin));
}

