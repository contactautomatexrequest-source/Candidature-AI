import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });

  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  let customerId = profile?.stripe_customer_id || undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: 499,
    recurring: { interval: "month" },
    product_data: { name: "Candidature AI – Premium" },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/compte?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/compte?status=cancel`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}


