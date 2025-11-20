import { CommencerButton } from "@/components/CommencerButton";

export default function HomePage() {
  return (
      <main className="min-h-[calc(100vh-56px)] pb-24">
      <section className="pt-10 lg:pt-16 bg-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 lg:flex-row lg:items-center lg:px-8">
              <div className="flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">
                Pour étudiants et débutants
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                Marché français
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-blue-600 sm:text-4xl">
                  Ton CV, ta lettre et ton message prêts en 2 minutes.
                </h1>
            <p className="mt-4 max-w-xl text-sm text-white">
              Tu colles l’offre, tu réponds à quelques questions, et Candidature AI génère un CV propre, une lettre de motivation ciblée et un message prêt à envoyer.
                </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                  <CommencerButton className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
                Commencer gratuitement
                  </CommencerButton>
                  <a
                    href="/fonctionnalites"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Voir les fonctionnalités
                  </a>
              <span className="text-xs text-white">Aucune carte bancaire requise pour tester.</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white">
              <span>Formulaire &lt; 2 minutes</span>
              <span>Résultat visible avant paiement</span>
              <span>Export PDF en 1 clic</span>
            </div>
          </div>
          <div className="mt-6 w-full max-w-md lg:mt-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <p className="text-sm font-semibold text-slate-900">Aperçu de candidature</p>
              <p className="mt-1 text-xs text-slate-600">Un aperçu simplifié du CV, de la lettre et du message générés.</p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">CV — Nom Prénom</p>
                  <p className="mt-1 text-xs text-slate-600">Titre, compétences, éducations, expériences…</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Lettre — introduction</p>
                  <p className="mt-1 text-xs text-slate-600">Madame, Monsieur, actuellement…</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Message LinkedIn / mail</p>
                  <p className="mt-1 text-xs text-slate-600">Bonjour, je me permets de vous contacter…</p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 text-center">En pratique</p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-blue-600">En 3 étapes simples</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Un parcours pensé pour t’éviter de passer tes soirées sur Word.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">1. Tu remplis le formulaire</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">Quelques infos sur toi, tes études et le poste.</p>
              </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">2. L’IA prépare ta candidature</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">CV, lettre et message cohérents avec l’offre.</p>
              </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">3. Tu ajustes et tu télécharges</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">Tu modifies si besoin, puis export en PDF.</p>
            </div>
            </div>
          </div>
        </section>
      </main>
  );
}
