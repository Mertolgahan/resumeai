---
title: "Supabase Authentication in Next.js: Complete Guide (2025)"
description: "Complete guide to setting up Supabase authentication in a Next.js application, including email/password, OAuth providers, protected routes, row-level security, and session management."
pubDate: 2025-04-23
category: "Authentication"
type: "guide"
keywords: ["supabase next.js authentication", "nextauth supabase", "next.js auth setup", "supabase auth nextjs", "next.js protected routes"]
---

## Why Supabase for Authentication?

Supabase Auth gives you a complete authentication system out of the box — email/password, OAuth providers, magic links, phone OTP, and row-level security. Combined with Next.js, it creates a powerful auth setup that scales from MVP to production.

This guide covers everything you need to implement Supabase Auth in a Next.js App Router application.

## Architecture: Supabase Auth + Next.js

There are two main approaches to authentication with Supabase and Next.js:

### Option A: Supabase Auth Only

```
User → Next.js Server Component → Supabase Client → Supabase Auth
```

Best for: Lightweight apps, simple auth needs, server-first architecture.

### Option B: NextAuth + Supabase (Recommended for SaaS)

```
User → Next.js Middleware → NextAuth Session → Supabase (for data)
```

Best for: SaaS applications that need both auth and a data layer. NextAuth handles sessions; Supabase handles data with row-level security.

SaaSKit Pro uses Option B because it gives you the best of both worlds: NextAuth's flexible session management with Supabase's powerful Postgres database.

## Step 1: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from **Settings → API**
3. Get your service role key (server-side only, never expose to the client)

### Create the Users Table

```sql
-- supabase/migrations/001_initial.sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Enable Auth Providers

In your Supabase Dashboard → **Authentication → Providers**:

1. **Email** — Enable with confirmation emails
2. **Google** — Add OAuth client ID and secret
3. **GitHub** — Add OAuth app credentials
4. Optionally: Magic links, phone OTP, etc.

## Step 2: Configure NextAuth

### Install Dependencies

```bash
npm install next-auth@beta @supabase/supabase-js
```

### Create Auth Configuration

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Create profile on first sign-in
      if (account?.provider === "google" || account?.provider === "github") {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.name,
          avatar_url: user.image,
        });
        if (error) console.error("Profile creation error:", error);
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
});
```

### Add API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

## Step 3: Create Login and Signup Pages

### Login Page

```tsx
// src/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });
    if (result?.error) setError("Invalid email or password");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-2 text-white"
          >
            Sign In
          </button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex-1 rounded border px-4 py-2"
          >
            Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex-1 rounded border px-4 py-2"
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Signup Page

```tsx
// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { signIn } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your account!");
    }
  }

  // ... render form similar to login
}
```

## Step 4: Protected Routes with Middleware

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  const publicPaths = ["/", "/login", "/signup", "/pricing", "/blog"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
```

## Step 5: Row-Level Security (RLS)

RLS is Supabase's killer feature for multi-tenant SaaS. It ensures users can only access their own data:

```sql
-- Each user can only see their own data
CREATE POLICY "Users can view own data"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can access everything (for webhooks)
-- This is automatic - service role bypasses RLS
```

### Querying with RLS in Server Components

```typescript
// Server component - RLS enforced automatically
import { createServerClient } from "@/lib/supabase";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return <div>Welcome, {profile?.full_name}</div>;
}
```

## Step 6: Session Management

### Auth Provider Component

```tsx
// src/components/providers/auth-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Add to root layout:

```tsx
// src/app/layout.tsx
import { AuthProvider } from "@/components/providers/auth-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Using Auth in Client Components

```tsx
"use client";

import { useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session) return <LoginButton />;

  return (
    <div className="flex items-center gap-3">
      <span>{session.user?.name}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Step 7: Password Reset Flow

### Forgot Password Page

```tsx
// src/app/forgot-password/page.tsx
const handleReset = async (e: React.FormEvent) => {
  e.preventDefault();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  // Show success message
};
```

### Reset Password Page

```tsx
// src/app/reset-password/page.tsx
const handleReset = async (e: React.FormEvent) => {
  e.preventDefault();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  // Redirect to login
};
```

## Common Pitfalls

1. **Exposing service role keys on the client** — The `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client components. Use it only in API routes and server components.

2. **Not enabling RLS** — Without row-level security, any authenticated user can read all data. Always enable RLS on every table.

3. **Missing email confirmation** — For OAuth providers, users are confirmed automatically. For email/password, configure Supabase to send confirmation emails.

4. **Race conditions in callbacks** — The `signIn` callback might run before the Supabase profile is created. Use upserts instead of inserts to handle this.

5. **Middleware running on static files** — Always exclude `_next/static`, `_next/image`, and `favicon.ico` from auth middleware.

## Testing Your Auth Setup

### Test Cases to Verify

- [ ] Email/password signup creates a user and profile
- [ ] Google OAuth creates a user and profile
- [ ] GitHub OAuth creates a user and profile
- [ ] Unauthenticated users are redirected to /login
- [ ] Authenticated users can't access /login or /signup
- [ ] Session persists across page navigation
- [ ] Sign out clears the session
- [ ] Password reset email is sent
- [ ] RLS prevents users from accessing other users' data

## Production Deployment Checklist

- [ ] Set `NEXTAUTH_SECRET` to a strong random value
- [ ] Configure `NEXTAUTH_URL` to your production domain
- [ ] Add your production URL to Google/GitHub OAuth redirect URIs
- [ ] Enable HTTPS only
- [ ] Set Supabase email templates for production
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up monitoring for failed login attempts

## Related Guides

- [How to Build a SaaS with Next.js](/blog/how-to-build-saas-nextjs) — Full stack overview
- [Stripe Integration Guide](/blog/stripe-nextjs-integration) — Add payments to your auth system
- [SaaS Boilerplate Comparison](/blog/nextjs-saas-boilerplate-comparison) — Compare pre-built solutions

> **Want auth pre-configured?** [SaaSKit Pro](/) includes NextAuth v5 + Supabase with OAuth, credentials, password reset, and protected routes — all ready to go.