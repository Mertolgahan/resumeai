import Stripe from "stripe";
import { env } from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    dailyLimit: 10,
    monthlyLimit: 100,
    projectLimit: 1,
    features: [
      "10 generations/day",
      "100 generations/month",
      "1 project",
      "Basic models",
      "Email support",
    ],
  },
  starter: {
    name: "Starter",
    monthlyPrice: 9,
    yearlyPrice: 90,
    monthlyPriceId: env.STRIPE_STARTER_PRICE_ID,
    yearlyPriceId: env.STRIPE_STARTER_YEARLY_PRICE_ID,
    dailyLimit: 100,
    monthlyLimit: 3000,
    projectLimit: 5,
    features: [
      "100 generations/day",
      "3,000 generations/month",
      "5 projects",
      "All models",
      "Priority support",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    monthlyPriceId: env.STRIPE_PRO_PRICE_ID,
    yearlyPriceId: env.STRIPE_PRO_YEARLY_PRICE_ID,
    dailyLimit: 1000,
    monthlyLimit: 30000,
    projectLimit: 25,
    features: [
      "1,000 generations/day",
      "30,000 generations/month",
      "25 projects",
      "All models",
      "Priority support",
      "API access",
      "Custom prompts",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 990,
    monthlyPriceId: env.STRIPE_ENTERPRISE_PRICE_ID,
    yearlyPriceId: env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    dailyLimit: -1,
    monthlyLimit: -1,
    projectLimit: -1,
    features: [
      "Unlimited generations",
      "Unlimited projects",
      "All models",
      "Dedicated support",
      "API access",
      "Custom prompts",
      "Team collaboration",
      "SLA guarantee",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanLimits(plan: string): {
  dailyLimit: number;
  monthlyLimit: number;
  projectLimit: number;
} {
  const planKey = (plan === "active" ? "pro" : plan) as PlanType;
  const p = PLANS[planKey] || PLANS.free;
  return {
    dailyLimit: p.dailyLimit,
    monthlyLimit: p.monthlyLimit,
    projectLimit: p.projectLimit,
  };
}

export function getStripeCustomerId(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name: name || undefined,
  });
}

export function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}