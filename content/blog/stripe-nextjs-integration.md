---
title: "Adding Stripe Payments to Your Next.js SaaS: Complete Integration Guide"
description: "Step-by-step tutorial for integrating Stripe payments into a Next.js SaaS application, including Checkout, Customer Portal, webhooks, subscription management, and handling edge cases."
pubDate: 2025-04-23
category: "Payments"
type: "tutorial"
keywords: ["stripe next.js", "stripe integration next.js", "saas payments stripe", "stripe checkout nextjs", "stripe webhooks"]
---

## Why Stripe for SaaS Payments?

Stripe is the gold standard for SaaS payments. It handles subscriptions, invoicing, trials, upgrades, downgrades, and tax calculation — so you don't have to. If you're building a SaaS with Next.js, Stripe is the natural choice.

This guide walks you through a complete production-ready Stripe integration, from installation to handling webhooks.

## Prerequisites

- A Next.js application (App Router)
- A Stripe account ([stripe.com](https://stripe.com))
- Supabase or another database for storing subscription state

## Architecture Overview

Here's how Stripe flows work in a Next.js SaaS:

```
User clicks "Subscribe"
      ↓
Next.js API route creates Checkout Session
      ↓
User redirected to Stripe Checkout
      ↓
Payment succeeds → Stripe sends webhook
      ↓
Webhook handler updates database
      ↓
User redirected to dashboard with active subscription
```

## Step 1: Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

You'll use `stripe` on the server (API routes) and `@stripe/stripe-js` on the client.

## Step 2: Configure Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Server-Side
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Client-Side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
STRIPE_FREE_PRICE_ID=price_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

Never commit these to Git. Use `.env.example` for reference only.

## Step 3: Create Stripe Products and Prices

In your Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create each plan (Free, Starter, Pro)
3. Set pricing (monthly and/or annual)
4. Copy the `price_id` for each plan

Or use the Stripe CLI:

```bash
stripe products create --name="Starter" --description="Starter Plan"
stripe prices create --product=prod_xxx --unit-amount=900 --currency=usd --recurring[interval]=month
```

## Step 4: Create a Checkout Session

This is the API route that creates a payment link:

```typescript
// src/app/api/stripe/checkout/route.ts
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await req.json();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: session.user.email,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### Client-Side Checkout

```typescript
// In your pricing page component
"use client";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

async function handleSubscribe(priceId: string) {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const { url } = await response.json();
  window.location.href = url;
}
```

## Step 5: Handle Webhooks

Webhooks are how Stripe tells your app about payment events. This is the most critical part:

```typescript
// src/app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await supabase.from("subscriptions").upsert({
        user_email: session.customer_email,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: "active",
        plan: session.metadata?.plan || "starter",
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await supabase.from("subscriptions").update({
        status: subscription.status,
        plan: subscription.metadata?.plan,
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      }).eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase.from("subscriptions").update({
        status: "canceled",
      }).eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      // Handle failed payment (notify user, retry logic)
      console.error("Payment failed for:", invoice.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### Setting Up Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This forwards Stripe events to your local dev server.

## Step 6: Customer Portal

Let users manage their subscriptions (upgrade, downgrade, cancel) without custom UI:

```typescript
// src/app/api/stripe/portal/route.ts
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the Stripe customer ID from your database
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_email", session.user.email)
    .single();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No customer" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### Client-Side Portal Access

```tsx
// In your billing page component
async function handleManageSubscription() {
  const response = await fetch("/api/stripe/portal", {
    method: "POST",
  });
  const { url } = await response.json();
  window.location.href = url;
}
```

## Step 7: Protecting Routes Based on Subscription

Use your database to check subscription status in middleware:

```typescript
// In your dashboard layout or API routes
const { data: subscription } = await supabase
  .from("subscriptions")
  .select("status, plan")
  .eq("user_email", user.email)
  .single();

if (subscription?.status !== "active") {
  redirect("/pricing");
}
```

## Step 8: Handling Edge Cases

### Trial Periods

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  subscription_data: {
    trial_period_days: 14,
  },
  // ... other options
});
```

### Upgrade/Downgrade

Use Stripe's [proration](https://stripe.com/docs/billing/subscriptions/prorations) — it's automatic. Just update the subscription's price:

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscription.items.data[0].id,
    price: newPriceId,
  }],
  proration_behavior: "create_prorations",
});
```

### Failed Payment Recovery

Handle `invoice.payment_failed` in your webhook. Stripe's Smart Retries will attempt payment multiple times. Configure this in your Stripe Dashboard under **Billing → Automatic recovery**.

## Testing Your Integration

### Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 9995` | Insufficient funds |

Always use a future expiry date and any CVC/postal code.

### Test Webhooks

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Common Mistakes to Avoid

1. **Not verifying webhook signatures** — Always use `stripe.webhooks.constructEvent()`. Raw body parsing is essential.

2. **Missing idempotency** — Webhook events can be sent twice. Use upserts or unique constraints to prevent duplicate records.

3. **Storing price amounts in your database** — Always reference Stripe as the source of truth for pricing. Store `price_id`, not the dollar amount.

4. **Not handling subscription `canceled` vs `active`** — A canceled subscription that hasn't expired yet is still active until `current_period_end`.

5. **Forgetting to test with Stripe CLI** — Always test webhooks locally before deploying.

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Set webhook endpoint in Stripe Dashboard (pointing to your production URL)
- [ ] Configure Stripe Customer Portal settings
- [ ] Set up Stripe email receipts
- [ ] Enable Stripe Billing settings (prorations, grace periods)
- [ ] Add rate limiting to your webhook endpoint
- [ ] Set up monitoring for failed payments
- [ ] Test the complete flow end-to-end in production

## Next Steps

- Read our guide on [How to Build a SaaS with Next.js](/blog/how-to-build-saas-nextjs) for the full stack overview
- Check out [Free vs Paid SaaS Boilerplates](/blog/free-vs-paid-saas-boilerplate) to see if a pre-built solution saves you time
- For auth setup, see our [Supabase Authentication Guide](/blog/supabase-nextjs-auth)

> **Want this all pre-wired?** [SaaSKit Pro](/) comes with Stripe checkout, portal, and webhooks ready to go. No configuration needed.