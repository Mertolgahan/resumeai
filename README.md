# ResumeAI — AI-Powered Resume & Cover Letter Builder

Stream 3 of the 3-Stream Automated Revenue System. An AI/SaaS wrapper MVP built with Next.js, Supabase, and OpenAI.

## Overview

ResumeAI generates professional, ATS-optimized resumes and cover letters using AI (GPT-4o-mini). Users input their experience, education, and skills, and the AI crafts compelling, targeted content.

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Framework | Next.js 14 (App Router) | $0 |
| Hosting | Vercel (Hobby tier) | $0 |
| Database | Supabase (Free tier) | $0 |
| Auth | Supabase Auth (Free: 50K MAU) | $0 |
| AI | OpenAI GPT-4o-mini | ~$0.01-0.10/resume |
| Payments | Stripe | % of sale |
| Email | Resend (Free: 100/day) | $0 |
| **Total Month 1** | | **$1/month + API usage** |

## Prerequisites

- Node.js 18+
- Supabase account (free)
- OpenAI API key
- Stripe account (test mode for development)

## Setup

### 1. Install dependencies

```bash
cd resumeai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your actual values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase project settings (keep secret!)
- `OPENAI_API_KEY` - From OpenAI dashboard
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- `STRIPE_PRO_PRICE_ID` - Create in Stripe
- `STRIPE_LIFETIME_PRICE_ID` - Create in Stripe
- `NEXT_PUBLIC_APP_URL` - http://localhost:3000 for dev
- `STRIPE_WEBHOOK_SECRET` - From Stripe CLI or dashboard

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Go to Authentication > Providers and enable Email and Google OAuth
4. Copy the project URL and anon key to `.env.local`

### 4. Set up Stripe

1. Create products and prices in Stripe:
   - Pro Monthly: $9/month recurring
   - Lifetime: $29 one-time
2. Copy the price IDs to `.env.local`
3. For local webhook testing, install Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pricing Tiers

| Tier | Price | Features |
|------|-------|---------|
| **Free** | $0 | 1 resume generation, watermarked PDF |
| **Pro** | $9/month | Unlimited resumes, cover letters, no watermark, ATS optimization |
| **Lifetime** | $29 one-time | Same as Pro, forever (launch promo, first 100 users) |

## Project Structure

```
resumeai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── dashboard/page.tsx          # Resume builder dashboard
│   │   ├── pricing/page.tsx            # Pricing page
│   │   ├── auth/callback/route.ts      # Auth callback
│   │   └── api/
│   │       ├── generate-resume/route.ts
│   │       ├── generate-cover-letter/route.ts
│   │       └── stripe/
│   │           ├── checkout/route.ts
│   │           ├── webhook/route.ts
│   │           └── portal/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ResumeInputForm.tsx
│   │   ├── ResumePreview.tsx
│   │   ├── CoverLetterGenerator.tsx
│   │   └── Icons.tsx
│   ├── lib/
│   │   ├── openai.ts                  # AI generation logic + types
│   │   ├── stripe.ts                  # Stripe config + plans
│   │   └── supabase.ts                # Supabase client
│   └── types/
│       └── index.ts                   # TypeScript types
├── supabase/
│   └── schema.sql                     # Database schema + RLS
├── .env.example
├── .env.local                         # (gitignored)
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-resume` | Generate AI resume from user input |
| POST | `/api/generate-cover-letter` | Generate AI cover letter |
| GET | `/api/stripe/checkout?plan=pro\|lifetime` | Create Stripe checkout session |
| POST | `/api/stripe/webhook` | Handle Stripe webhooks |
| POST | `/api/stripe/portal` | Create Stripe billing portal session |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Revenue Projections

| Scenario | Month 1 | Month 2 | Month 3 |
|----------|---------|---------|---------|
| Conservative | $90 (10 Pro users) | $270 (30 Pro users) | $540 (60 Pro users) |
| Moderate | $450 (50 Pro users) | $1,350 (150 Pro users) | $2,700 (300 Pro users) |
| Optimistic | $900 (100 Pro users) | $2,700 (300 Pro users) | $5,400 (600 Pro users) |

## Cross-Promotion

- Stream 1 (Digital Products): "AI Resume Templates" Notion template upsells to ResumeAI Pro
- Stream 2 (Content): "This AI wrote my resume in 30 seconds" videos drive traffic
- Shared Linktree bio link and email list for cross-promotion

## License

Private — part of the Para Basma Makinası automated revenue system.