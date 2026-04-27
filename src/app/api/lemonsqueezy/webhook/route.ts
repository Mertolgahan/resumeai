import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/lemonsqueezy/webhook
 *
 * Webhook handler for LemonSqueezy events.  Protect this URL with
 * the X-Signature header (HMAC-SHA256 over the raw JSON body).
 *
 * Supported events:
 *  - order_created       — one-time purchase (lifetime)
 *  - subscription_created — new subscription (monthly pro)
 *  - subscription_payment_success
 *  - subscription_cancelled
 *  - subscription_expired
 *  - subscription_paused
 *  - subscription_resumed
 */
export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || secret.length === 0) {
    console.error("[webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Node/Next.js bodies are consumed by the request.json() helper —
  // for signature verification we need the raw body text.
  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature") || "";

  if (!signature || signature.length === 0) {
    return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
  }

  const ok = verifyWebhookSignature(rawBody, signature, secret);
  if (!ok) {
    console.error("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch (_err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const typedPayload = payload as { meta?: { event_name?: string }; data?: Record<string, unknown> };
  const eventName = typedPayload.meta?.event_name;
  const data = typedPayload.data;

  if (!eventName || !data) {
    return NextResponse.json({ error: "Malformed webhook payload" }, { status: 400 });
  }

  const attrs = data.attributes as Record<string, unknown> | undefined;
  if (!attrs) {
    return NextResponse.json({ error: "Missing event attributes" }, { status: 400 });
  }

  try {
    switch (eventName) {
      case "order_created": {
        await handleOrderCreated(attrs);
        break;
      }
      case "subscription_created": {
        await handleSubscriptionCreated(data);
        break;
      }
      case "subscription_payment_success": {
        await handleSubscriptionPayment(data);
        break;
      }
      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused": {
        await handleSubscriptionStatusChange(data, "canceled");
        break;
      }
      case "subscription_resumed": {
        await handleSubscriptionResumed(data);
        break;
      }
      default: {
        console.log(`[webhook] Unhandled event: ${eventName}`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] Error processing ${eventName}:`, message);
    // Return 200 anyway so LemonSqueezy doesn't retry indefinitely
    return NextResponse.json({ ok: true, processed: false, error: message });
  }

  return NextResponse.json({ ok: true, processed: true });
}

/* ------------------------------------------------------------------ */
/*  Event handlers                                                    */
/* ------------------------------------------------------------------ */

async function handleOrderCreated(attrs: Record<string, unknown>) {
  const userEmail = String(attrs.user_email || "");
  const status = String(attrs.status || "");
  const customData = (attrs.custom_data as Record<string, unknown> | null) || {};
  const planFromPayload = String(customData.plan || "");

  if (!userEmail) {
    console.warn("[webhook] order_created: missing user_email");
    return;
  }

  if (status !== "paid") {
    console.log(`[webhook] order_created: order status is ${status}, skipping`);
    return;
  }

  // Resolve plan (fallback to lifetime for one-time orders if not provided)
  let plan: "lifetime" | "pro" = planFromPayload === "pro" ? "pro" : "lifetime";

  const profile = await findProfileByEmail(userEmail);
  if (!profile) {
    console.warn(`[webhook] order_created: no profile for ${userEmail}`);
    return;
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      lemonsqueezy_customer_id: String(attrs.customer_id || ""),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id);

  console.log(`[webhook] order_created: upgraded ${userEmail} to ${plan}`);
}

async function handleSubscriptionCreated(data: Record<string, unknown>) {
  const attrs = data.attributes as Record<string, unknown>;
  const userEmail = String(attrs.user_email || "");
  const customData = (attrs.custom_data as Record<string, unknown> | null) || {};
  const plan = String(customData.plan || "pro");

  if (!userEmail) {
    console.warn("[webhook] subscription_created: missing user_email");
    return;
  }

  const profile = await findProfileByEmail(userEmail);
  if (!profile) {
    console.warn(`[webhook] subscription_created: no profile for ${userEmail}`);
    return;
  }

  const subscriptionId = String(data.id || "");
  const variantId = Number(attrs.variant_id || 0);

  await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      lemonsqueezy_customer_id: String(attrs.customer_id || ""),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id);

  // Upsert subscription record
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: profile.user_id,
      payment_provider: "lemonsqueezy",
      provider_subscription_id: subscriptionId,
      provider_price_id: String(variantId),
      status: "active",
      current_period_end: attrs.renews_at
        ? new Date(String(attrs.renews_at)).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_subscription_id" }
  );

  if (error) {
    console.error("[webhook] subscription_upsert error:", error.message);
  } else {
    console.log(`[webhook] subscription_created: ${userEmail} → ${plan}`);
  }
}

async function handleSubscriptionPayment(data: Record<string, unknown>) {
  const attrs = data.attributes as Record<string, unknown>;
  const subscriptionId = Number(attrs.subscription_id || 0);

  if (!subscriptionId) {
    console.warn("[webhook] subscription_payment_success: missing subscription_id");
    return;
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      current_period_end: attrs.renews_at
        ? new Date(String(attrs.renews_at)).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_subscription_id", String(subscriptionId));

  if (error) {
    console.error("[webhook] subscription_payment update error:", error.message);
  }
}

async function handleSubscriptionStatusChange(
  data: Record<string, unknown>,
  status: "active" | "canceled"
) {
  const subscriptionId = String(data.id || "");
  if (!subscriptionId) return;

  // Find the user from subscriptions table
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("provider_subscription_id", subscriptionId)
    .single();

  if (!sub) {
    console.warn(`[webhook] subscription_status: unknown subscription ${subscriptionId}`);
    return;
  }

  await supabaseAdmin
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("provider_subscription_id", subscriptionId);

  // Downgrade to free if canceled/expired
  if (status === "canceled") {
    await supabaseAdmin
      .from("profiles")
      .update({ plan: "free", updated_at: new Date().toISOString() })
      .eq("user_id", sub.user_id);
  }

  console.log(`[webhook] subscription_${status}: ${subscriptionId}`);
}

async function handleSubscriptionResumed(data: Record<string, unknown>) {
  const subscriptionId = String(data.id || "");
  if (!subscriptionId) return;

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("provider_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("provider_subscription_id", subscriptionId);

  await supabaseAdmin
    .from("profiles")
    .update({ plan: "pro", updated_at: new Date().toISOString() })
    .eq("user_id", sub.user_id);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

async function findProfileByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, email")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error("[webhook] findProfileByEmail error:", error.message);
    return null;
  }
  return data;
}
