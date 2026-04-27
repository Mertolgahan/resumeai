import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import Stripe from "stripe";
import { env } from "@/lib/env";

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await getSupabaseAdmin()
    .from("users")
    .update({
      stripe_customer_id: customerId,
      subscription_id: subscriptionId,
      subscription_status: subscription.status === "active" ? "active" : subscription.status,
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await getSupabaseAdmin()
    .from("users")
    .update({
      subscription_id: null,
      subscription_status: "free",
    })
    .eq("subscription_id", subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await getSupabaseAdmin()
    .from("users")
    .update({
      subscription_status: subscription.status === "active" ? "active" : subscription.status,
    })
    .eq("subscription_id", subscription.id);
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSession(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}