# Sales Channel Setup Guide — SaaSKit Pro + ContentAI

> Complete guide for setting up Gumroad/LemonSqueezy + Stripe sales channels.
> Prepared by CMO. Some steps require human action (account creation, payment credentials).

---

## Overview

| Channel | Product | Pricing | Platform |
|---------|---------|---------|----------|
| Digital Product | SaaSKit Pro (Boilerplate) | Early Bird $149 / Regular $249 | Gumroad or LemonSqueezy |
| SaaS Subscription | ContentAI (AI Content Generation) | Free / Starter $9/mo / Pro $29/mo / Enterprise $99/mo | Stripe Checkout |

---

## Part 1: Gumroad / LemonSqueezy — SaaSKit Pro

### Step 1: Create Account (HUMAN ACTION REQUIRED)

**Gumroad (Recommended for digital products):**
1. Go to https://gumroad.com/signup
2. Sign up with company email (e.g., hello@saaskit.pro)
3. Complete profile: name, bio, avatar
4. Set up payout method (bank account or PayPal)
5. Verify email and enable 2FA

**LemonSqueezy (Alternative — better for EU tax handling):**
1. Go to https://www.lemonsqueezy.com/signup
2. Sign up with company email
3. Complete onboarding: store name, currency (USD), tax settings
4. Set up payout method
5. Verify email and enable 2FA

> **Recommendation:** Start with Gumroad for faster setup and larger marketplace audience. LemonSqueezy can be added later for EU customers.

### Step 2: Create SaaSKit Pro Product Listing

Use the copy from `SALES-PAGE-COPY.md`. Key fields:

| Field | Value |
|-------|-------|
| Product Name | SaaSKit Pro — Next.js 16 SaaS Boilerplate |
| Tagline | Ship your SaaS in days, not months. Production-ready Next.js 16 + Supabase + Stripe + AI. |
| Price (Early Bird) | $149 |
| Regular Price | $249 |
| Category | Software / Developer Tools |
| License Options | MIT License (Personal) / Commercial License (Business) |

**Gumroad listing setup:**
1. Create new product → "Digital product"
2. Set name and tagline from above
3. Upload product files (ZIP of source code)
4. Set pricing with pay-what-you-want minimum at $149
5. Add cover image (dashboard mockup)
6. Set up variants for license type:
   - Variant 1: MIT License — $149 (Early Bird) / $249 (Regular)
   - Variant 2: Commercial License — $299 (Early Bird) / $499 (Regular)
7. Add product description from SALES-PAGE-COPY.md
8. Set tags: `nextjs`, `saas`, `boilerplate`, `starter-kit`, `typescript`
9. Enable "Allow affiliates" (10% default commission)
10. Enable "Content scheduling" for update delivery

**Screenshots to prepare (6 images):**
1. Landing page hero section
2. Dashboard overview
3. AI content generation (streaming)
4. Pricing page
5. Dark mode
6. Mobile responsive

> **Note:** Screenshots depend on live deployment from [IIKAA-34](/IIKAA/issues/IIKAA-34). Prepare these once the site is live.

### Step 3: Gumroad Workflow Configuration

1. **Post-purchase email:**
   - Thank customer for purchase
   - Include GitHub repo invite link
   - Link to documentation (setup guide, deployment guide)
   - Add support email (hello@saaskit.pro)

2. **Update delivery:**
   - Connect Gumroad to GitHub (auto-build on new releases)
   - Or manually push updates via Gumroad's content scheduler
   - 1 year of updates included per license

3. **Affiliate program:**
   - Enable affiliate system
   - Default 10% commission
   - Create affiliate onboarding email

### Step 4: LemonSqueezy Setup (If Chosen)

If using LemonSqueezy instead of (or in addition to) Gumroad:

1. Create store → "SaaSKit Pro"
2. Create product → "SaaSKit Pro — Next.js 16 SaaS Boilerplate"
3. Set up pricing:
   - Early Bird variant: $149
   - Regular variant: $249
   - Commercial license variant: $499
4. Configure license key delivery (LemonSqueezy has built-in license management)
5. Set up EU tax handling (automatic with LemonSqueezy)
6. Connect payment method
7. Configure webhooks for license validation

---

## Part 2: Stripe Checkout — ContentAI Subscriptions

### Step 1: Create Stripe Account (HUMAN ACTION REQUIRED)

1. Go to https://dashboard.stripe.com/register
2. Sign up with company email
3. Complete business profile:
   - Business name: SaaSKit
   - Business type: Software / SaaS
   - Country: [Company jurisdiction]
   - Website: https://saaskit.pro
4. Add bank account for payouts
5. Complete identity verification
6. Enable Stripe Checkout in settings
7. Get API keys from Dashboard → Developers → API Keys
8. Set to "Live mode" when ready for production

### Step 2: Run Stripe Setup Script

The project includes `scripts/setup-stripe.sh` which creates all products and prices via the Stripe API.

**Prerequisites:**
- Stripe CLI installed: `brew install stripe/stripe-cli/stripe`
- Authenticated: `stripe login`
- Environment variable set: `export STRIPE_SECRET_KEY=sk_live_...`

**Execute:**
```bash
cd saas-kit
chmod +x scripts/setup-stripe.sh
./scripts/setup-stripe.sh
```

**This creates 4 products with monthly + yearly pricing:**

| Plan | Monthly | Yearly | Daily Limit | Monthly Limit |
|------|---------|--------|-------------|---------------|
| Starter | $9/mo ($9) | $90/yr | 100/day | 3,000/month |
| Pro | $29/mo ($29) | $290/yr | 1,000/day | 30,000/month |
| Enterprise | $99/mo ($99) | $990/yr | Unlimited | Unlimited |

(Free plan does not need a Stripe product — users auto-enroll)

### Step 3: Configure Environment Variables

After running setup-stripe.sh, add the output to `.env`:

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx
```

Also set the public keys:
```env
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx
```

### Step 4: Configure Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://saaskit.pro/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret → set `STRIPE_WEBHOOK_SECRET`

### Step 5: Configure Stripe Customer Portal

1. In Stripe Dashboard → Settings → Customer Portal
2. Enable portal
3. Configure allowed flows:
   - Subscription updates (upgrade/downgrade)
   - Subscription cancellation
   - Invoice history
4. Set return URL: `https://saaskit.pro/dashboard/billing`
5. Configure pricing table to show all 4 plans

### Step 6: Test Payment Flow (REQUIRES LIVE DEPLOYMENT)

**Use Stripe test mode first:**

1. Switch to test mode in Stripe Dashboard
2. Run `setup-stripe.sh` with test key (`sk_test_...`)
3. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
4. Test full flow:
   - Sign up → Free plan
   - Upgrade → Starter ($9) → Pro ($29) → Enterprise ($99)
   - Downgrade → Pro → Starter
   - Cancel → Back to Free
   - Yearly billing toggle
5. Verify webhook delivery in Stripe Dashboard → Webhooks → Events
6. Verify subscription status in database

**Switch to live mode when ready:**
1. Swap test keys for live keys in `.env`
2. Re-run `setup-stripe.sh` with live key
3. Re-configure webhook endpoint with live signing secret
4. Process one real test transaction ($9 Starter)
5. Verify payout arrives in bank account

---

## Part 3: Demo Account

### Create Demo Account (demo@saaskit.pro)

1. Register at https://saaskit.pro with email: `demo@saaskit.pro`
2. Set password (share via secure channel with team)
3. Assign Pro plan manually in Stripe dashboard
4. Generate some demo content (blog posts, social media, etc.)
5. Use for sales demos and screenshots

---

## Part 4: Landing Page CTA Links

### Redirect CTAs to Sales Channels

Update the landing page CTA buttons after channels are live:

| CTA Button | Current Target | New Target |
|------------|---------------|------------|
| "Buy Now" (SaaSKit Pro) | # | Gumroad/LemonSqueezy checkout URL |
| "Start Free" (ContentAI) | # | https://saaskit.pro/signup |
| "Upgrade" | # | Stripe Checkout (via app) |
| "Pricing" | # | https://saaskit.pro/pricing |

### Update pricing links:

1. Find pricing CTA component in the codebase
2. Replace `#` hrefs with:
   - Starter: `/api/stripe/checkout?plan=starter&billing=monthly`
   - Pro: `/api/stripe/checkout?plan=pro&billing=monthly`
   - Enterprise: `/api/stripe/checkout?plan=enterprise&billing=monthly`
3. Add "Buy Boilerplate" CTA → Gumroad product URL
4. Test all links point to active checkout pages

---

## Prerequisites & Blockers

| Requirement | Status | Issue |
|-------------|--------|-------|
| Live deployment of SaaSKit Pro + ContentAI | BLOCKED | [IIKAA-34](/IIKAA/issues/IIKAA-34) |
| Domain + SSL active (saaskit.pro) | BLOCKED (via IIKAA-34) | [IIKAA-34](/IIKAA/issues/IIKAA-34) |
| Gumroad / LemonSqueezy account creation | Needs human action | — |
| Stripe account creation + verification | Needs human action | — |
| Product screenshots | Needs live deployment | — |

---

## Execution Checklist

- [ ] Create Gumroad account
- [ ] Create SaaSKit Pro product listing on Gumroad
- [ ] Prepare product ZIP file (source code package)
- [ ] Upload cover images and screenshots
- [ ] Configure post-purchase email
- [ ] Set up affiliate program
- [ ] Create Stripe account
- [ ] Complete Stripe identity verification
- [ ] Run `setup-stripe.sh` with test keys
- [ ] Configure Stripe webhook endpoint
- [ ] Configure Stripe Customer Portal
- [ ] Test full payment flow in test mode
- [ ] Switch to live mode
- [ ] Create demo account (demo@saaskit.pro)
- [ ] Test end-to-end purchase on Gumroad
- [ ] Test end-to-end subscription on ContentAI
- [ ] Update landing page CTA links
- [ ] Verify all links work on live site

---

## Budget Notes

| Item | Cost | Notes |
|------|------|-------|
| Gumroad | 10% per sale | No monthly fee |
| LemonSqueezy | 5% + 50¢ per sale | No monthly fee |
| Stripe | 2.9% + 30¢ per transaction | Standard rate |
| Domain renewal | ~$12/year | saaskit.pro |

**Projected launch costs: $0 upfront** (all platforms charge per-transaction only)