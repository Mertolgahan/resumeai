-- LemonSqueezy migration
-- Add LemonSqueezy-specific fields and provider-agnostic columns.
-- Run this in Supabase SQL Editor after the base schema is already applied.

-- Add LemonSqueezy customer ID to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id text;

-- Rename Stripe-only column to generic payment_customer_id (if migrating from stripe schema)
-- If you already ran the original schema.sql, keep stripe_customer_id and add the generic one:
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_customer_id text;

-- Rename subscriptions columns to be provider-agnostic
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS payment_provider text default 'stripe';

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS provider_subscription_id text;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS provider_price_id text;

-- Ensure provider_subscription_id is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'subscriptions' AND indexname = 'idx_subscriptions_provider_id'
  ) THEN
    CREATE UNIQUE INDEX idx_subscriptions_provider_id ON public.subscriptions(provider_subscription_id);
  END IF;
END $$;

-- Allow status to include LemonSqueezy states
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_status_check
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused', 'unpaid', 'expired'));

-- Drop old stripe-specific unique index if present and replace with provider-aware variant
DROP INDEX IF EXISTS idx_subscriptions_stripe_id;

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON public.subscriptions(payment_provider);
