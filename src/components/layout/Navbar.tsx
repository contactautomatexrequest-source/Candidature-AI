"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <header className={`sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md transition-all ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            CI
          </span>
          <span>Candidature IA</span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs md:flex md:text-sm">
          <Link href="/pour-qui" className="relative text-slate-600 hover:text-slate-900">
            Pour qui
            {pathname === "/pour-qui" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all" />
            )}
          </Link>
          <Link href="/fonctionnalites" className="relative text-slate-600 hover:text-slate-900">
            Fonctionnalités
            {pathname === "/fonctionnalites" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all" />
            )}
          </Link>
          <Link href="/compte" className="relative text-slate-600 hover:text-slate-900">
            Mon compte
            {pathname === "/compte" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all" />
            )}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? "/commencer" : "/compte"}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Commencer
          </Link>
        </div>
      </div>
    </header>
  );
}



