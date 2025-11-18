import { AuthPanel } from "@/components/AuthPanel";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ProfileDefaultsForm } from "@/components/ProfileDefaultsForm";
import { GenerationsHistory } from "@/components/GenerationsHistory";
import { StripePortalButton } from "@/components/StripePortalButton";

export default function ComptePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 lg:px-8 py-10 lg:py-14 space-y-10">
      <section className="grid gap-6 md:grid-cols-2">
        <AuthPanel />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-slate-900">Abonnement</p>
          <p className="text-xs text-slate-700">Passe en premium pour retirer le watermark et garder l’historique.</p>
          <div className="space-y-2">
            <CheckoutButton />
            <StripePortalButton />
          </div>
        </div>
      </section>
      <section>
        <ProfileDefaultsForm />
      </section>
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-blue-600">Historique de tes candidatures</h2>
        <GenerationsHistory />
      </section>
    </main>
  );
}


