export default function PourQuiPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 lg:px-8 py-10 lg:py-14 space-y-10 bg-slate-950">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">À qui s’adresse Candidature AI ?</p>
        <h1 className="text-2xl font-semibold tracking-tight text-blue-600">L’outil des étudiants qui veulent postuler vite et bien.</h1>
        <p className="text-sm text-white">On se concentre sur les candidatures de début de carrière pour être vraiment pertinent.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Tu cherches un stage</p>
          <p className="mt-2 text-xs sm:text-sm text-slate-700">Tu veux envoyer plusieurs candidatures sans y passer tes soirées.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Tu es en alternance</p>
          <p className="mt-2 text-xs sm:text-sm text-slate-700">Tu dois postuler dans de nombreuses entreprises et tu as besoin d’une base rapide à adapter.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Tu vis ton premier job</p>
          <p className="mt-2 text-xs sm:text-sm text-slate-700">Tu as peu d’expérience mais beaucoup de motivation. On t’aide à présenter ton parcours simplement.</p>
        </div>
      </section>
      <section className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-blue-600">Tu te reconnais dans l’un de ces profils ?</h2>
        <p className="text-sm text-white">Teste gratuitement une candidature complète.</p>
        <a href="/commencer" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
          Commencer
        </a>
      </section>
    </main>
  );
}


