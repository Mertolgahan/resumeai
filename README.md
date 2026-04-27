# SaaSKit — Next.js 15 SaaS Starter Kit

Production-ready SaaS boilerplate built with Next.js 15, TypeScript, TailwindCSS, and shadcn/ui. Ship your SaaS 10x faster.

## Features

- **Authentication** — NextAuth v5 with Google, GitHub, and email/password
- **Stripe Billing** — Subscriptions, checkout sessions, billing portal, webhooks
- **Supabase Database** — PostgreSQL with Row Level Security
- **Dashboard** — Responsive layout with sidebar navigation and dark mode
- **Landing Page** — Hero, features, pricing, FAQ, and CTA sections
- **Email** — Resend integration for transactional emails
- **TypeScript** — Full type safety across the entire codebase
- **SEO** — Metadata API, Open Graph, and structured data ready
- **Dark Mode** — System-aware theme switching with next-themes

## Tech Stack

| Category | Technology |
| -------- | ---------- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 + shadcn/ui |
| Auth | NextAuth v5 |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| Email | Resend |
| Icons | Lucide React |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account (optional, for email)

### 1. Clone and Install

```bash
git clone <your-repo-url> saas-kit
cd saas-kit
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx

# Resend (optional)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OAuth (optional)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### 3. Database Setup

Create a new Supabase project, then run the migration:

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Copy the SQL from supabase/migrations/001_initial.sql
# and run it in the Supabase SQL Editor
```

### 4. Stripe Setup

1. Create products and prices in Stripe:
   - Pro Monthly: $29/month
   - Pro Yearly: $290/year
2. Copy the price IDs to your `.env.local`
3. Set up a webhook endpoint pointing to `/api/stripe/webhook`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
saas-kit/
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # Dashboard overview
│   │   │       ├── billing/     # Billing & subscription management
│   │   │       └── settings/    # User settings
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth & signup routes
│   │   │   ├── stripe/         # Stripe checkout, portal, webhook
│   │   │   └── user/           # User profile API
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── pricing/            # Pricing page
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── landing/            # Landing page sections
│   │   ├── layout/             # Header, Footer
│   │   ├── providers/          # Theme & Auth providers
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── env.ts              # Environment variables
│   │   ├── stripe.ts           # Stripe client & helpers
│   │   ├── supabase.ts         # Supabase client & types
│   │   └── utils.ts            # Utility functions
│   └── middleware.ts           # Auth middleware
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # Database schema
└── .env.example                # Environment template
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
EXPOSE 3000
```

### Stripe Webhook (Production)

Set up a Stripe webhook pointing to your production URL:

```
https://your-domain.com/api/stripe/webhook
```

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Customization

### Branding

1. Update `SaaSKit` occurrences with your brand name
2. Modify colors in `src/app/globals.css` (CSS variables under `:root` and `.dark`)
3. Replace the logo in `src/components/layout/header.tsx`
4. Update metadata in `src/app/layout.tsx`

### Features

The dashboard currently shows placeholder metrics. Extend it by:
1. Adding new database tables in `supabase/migrations/`
2. Creating new API routes under `src/app/api/`
3. Building new dashboard pages under `src/app/(dashboard)/`
4. Adding sidebar links in `src/app/(dashboard)/layout.tsx`

### Pricing

Modify plans and features in `src/lib/stripe.ts`:

```typescript
export const PLANS = {
  free: { name: "Free", price: 0, features: [...] },
  pro: { name: "Pro", monthlyPrice: 29, yearlyPrice: 290, features: [...] },
};
```

## License

This starter kit is proprietary software. Purchase a license to use it in your projects.

## Support

- GitHub Issues: Report bugs and request features
- Email: support@yourdomain.com