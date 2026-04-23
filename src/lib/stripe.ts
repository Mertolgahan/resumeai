import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    resumesPerMonth: 1,
    coverLetters: false,
    watermark: true,
    atsOptimization: false,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 9,
    resumesPerMonth: -1,
    coverLetters: true,
    watermark: false,
    atsOptimization: true,
  },
  lifetime: {
    name: "Lifetime",
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID!,
    price: 29,
    resumesPerMonth: -1,
    coverLetters: true,
    watermark: false,
    atsOptimization: true,
  },
} as const;

export type PlanType = keyof typeof PLANS;