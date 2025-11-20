"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

interface CommencerButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function CommencerButton({ className, children }: CommencerButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Link
        href="/compte"
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={isLoggedIn ? "/commencer" : "/compte"}
      className={className}
    >
      {children}
    </Link>
  );
}

