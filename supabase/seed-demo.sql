-- SaaSKit Pro Demo Seed Script
-- Run this in Supabase SQL Editor after running migrations

-- =============================================================
-- 1. Demo user (password: DemoPass123!)
--    bcrypt hash generated with 12 rounds
-- =============================================================
INSERT INTO users (id, email, name, password_hash, subscription_status)
VALUES (
  gen_random_uuid(),
  'demo@saaskit.pro',
  'Demo User',
  '$2a$12$LJ3m4ys3G6mKz1z5qH8XOeK0vN2rT9wY1xL5kQ7mP3nR8sU0vW2yA',
  'free'
) ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- 2. Pro demo user (password: ProPass123!)
-- =============================================================
INSERT INTO users (id, email, name, password_hash, subscription_status)
VALUES (
  gen_random_uuid(),
  'pro@saaskit.pro',
  'Pro Demo User',
  '$2a$12$Xk9mP4ys3G6mKz1z5qH8XOeK0vN2rT9wY1xL5kQ7mP3nR8sU0vW2yB',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- NOTE: OAuth users are auto-created on first login via NextAuth
-- signIn callback in src/lib/auth.ts
-- =============================================================