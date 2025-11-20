"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CommencerButton } from "@/components/CommencerButton";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          <Link href="/pour-qui" className="relative text-slate-600 hover:text-slate-900 transition-colors">
            Pour qui
            {pathname === "/pour-qui" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all animate-fade-in" />
            )}
          </Link>
          <Link href="/fonctionnalites" className="relative text-slate-600 hover:text-slate-900 transition-colors">
            Fonctionnalités
            {pathname === "/fonctionnalites" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all animate-fade-in" />
            )}
          </Link>
          <Link href="/compte" className="relative text-slate-600 hover:text-slate-900 transition-colors">
            Mon compte
            {pathname === "/compte" && (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded bg-blue-600 transition-all animate-fade-in" />
            )}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <CommencerButton className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover-lift">
            Commencer
          </CommencerButton>
        </div>
      </div>
    </header>
  );
}



