import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Candidature AI – CV, lettre et message prêts en 2 minutes",
  description:
    "Un SaaS minimaliste pour les étudiants et débutants : CV, lettre de motivation et message LinkedIn/mail générés automatiquement en quelques clics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
