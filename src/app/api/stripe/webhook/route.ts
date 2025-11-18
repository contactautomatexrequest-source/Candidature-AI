import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (userId) {
        await supabaseAdmin.from("profiles").update({ subscription_status: "active" }).eq("id", userId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub as any).metadata?.supabase_user_id;
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: sub.status === "active" ? "active" : (sub.status as string) })
          .eq("id", userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub as any).metadata?.supabase_user_id;
      if (userId) {
        await supabaseAdmin.from("profiles").update({ subscription_status: "canceled" }).eq("id", userId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}


