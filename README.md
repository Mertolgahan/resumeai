# ResumeAI — AI-Powered Resume & Cover Letter Builder

Stream 3 of the 3-Stream Automated Revenue System. An AI/SaaS wrapper MVP built with Next.js, Supabase, and OpenAI.

## Overview

ResumeAI generates professional, ATS-optimized resumes and cover letters using AI (GPT-4o-mini). Users input their experience, education, and skills, and the AI crafts compelling, targeted content.

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Framework | Next.js 16 (App Router) | $0 |
| Hosting | Vercel (Hobby tier) | $0 |
| Database | Supabase (Free tier) | $0 |
| Auth | Supabase Auth (Free: 50K MAU) | $0 |
| AI | OpenAI GPT-4o-mini via OpenRouter | ~$0.01-0.10/resume |
| Payments | LemonSqueezy | % of sale |
| Email | Resend (Free: 100/day) | $0 |
| **Total Month 1** | | **$1/month + API usage** |

## Prerequisites

- Node.js 18+
- Supabase account (free)
- OpenRouter API key
- LemonSqueezy account (test mode for development)

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
- `OPENROUTER_API_KEY` - From OpenRouter dashboard
- `NEXT_PUBLIC_APP_URL` - http://localhost:3000 for dev
- `LEMONSQUEEZY_API_KEY` - From LemonSqueezy Settings > API
- `LEMONSQUEEZY_STORE_ID` - Your LemonSqueezy store ID
- `LEMONSQUEEZY_PRO_VARIANT_ID` - Create a Pro subscription variant in LemonSqueezy
- `LEMONSQUEEZY_LIFETIME_VARIANT_ID` - Create a Lifetime product variant in LemonSqueezy
- `LEMONSQUEEZY_WEBHOOK_SECRET` - From your webhook settings in LemonSqueezy

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Go to Authentication > Providers and enable Email and Google OAuth
4. Copy the project URL and anon key to `.env.local`

### 4. Set up LemonSqueezy

1. Create products and variants in LemonSqueezy:
   - **Pro Monthly** — $9/month recurring
   - **Lifetime** — $29 one-time
2. Copy the **variant IDs** (not product IDs) to `.env.local`
3. Add a webhook in LemonSqueezy pointing to:
   ```
   https://your-domain.com/api/lemonsqueezy/webhook
   ```
   Select these events:
   - `order_created`
   - `subscription_created`
   - `subscription_payment_success`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_paused`
   - `subscription_resumed`
4. Copy the webhook signing secret to `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`

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
│   │       └── lemonsqueezy/
│   │           ├── checkout/route.ts   # LemonSqueezy checkout
│   │           └── webhook/route.ts    # LemonSqueezy webhooks
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ResumeInputForm.tsx
│   │   ├── ResumePreview.tsx
│   │   ├── CoverLetterGenerator.tsx
│   │   └── Icons.tsx
│   ├── lib/
│   │   ├── openai.ts                  # AI generation logic + types
│   │   ├── lemonsqueezy.ts            # LemonSqueezy config + plans
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
| GET | `/api/lemonsqueezy/checkout?plan=pro\|lifetime` | Create LemonSqueezy checkout session |
| POST | `/api/lemonsqueezy/webhook` | Handle LemonSqueezy webhooks |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy
5. Update your LemonSqueezy webhook URL to the production domain

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
