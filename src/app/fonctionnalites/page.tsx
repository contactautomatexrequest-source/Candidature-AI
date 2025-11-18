import { CheckoutButton } from "@/components/CheckoutButton";

export default function FonctionnalitesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 lg:px-8 py-10 lg:py-14 space-y-12 bg-slate-950">
      <section className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Comment ça marche</p>
        <h1 className="text-2xl font-semibold tracking-tight text-blue-600">De l’offre au PDF, sans friction.</h1>
        <p className="text-sm text-white">Le parcours est pensé pour tenir en moins de 2 minutes.</p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-2 text-left">
          <p className="text-sm text-white">1. Crée un compte avec ton e-mail.</p>
          <p className="text-sm text-white">2. Colle l’offre et remplis le formulaire.</p>
          <p className="text-sm text-white">3. L’IA génère CV, lettre et message.</p>
          <p className="text-sm text-white">4. Tu ajustes et tu télécharges en PDF.</p>
        </div>
      </section>
      <section>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-blue-600">Gratuit ou Premium, à toi de choisir.</h2>
          <p className="text-sm text-white">Tu vois d’abord ton résultat, ensuite tu décides si tu passes en premium.</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Gratuit</p>
            <p className="mt-1 text-xs text-slate-600">0 € – pour toujours</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>1 CV généré</li>
              <li>1 lettre de motivation</li>
              <li>1 message LinkedIn / mail</li>
              <li>Watermark sur les PDFs</li>
              <li>Accès au formulaire complet</li>
            </ul>
            <a href="/commencer" className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
              Essayer gratuitement
            </a>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-slate-900">Premium</p>
            <p className="mt-1 text-xs text-slate-600">4,99 € – par mois</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>CV illimités</li>
              <li>Lettres illimitées</li>
              <li>Messages/mails illimités</li>
              <li>PDF sans watermark</li>
              <li>Historique de tes candidatures</li>
            </ul>
            <CheckoutButton />
          </div>
        </div>
      </section>
    </main>
  );
}


