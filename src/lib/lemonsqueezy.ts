import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";

export interface LemonsqueezyPlan {
  name: string;
  variantId: string;
  price: number;
  resumesPerMonth: number;
  coverLetters: boolean;
  watermark: boolean;
  atsOptimization: boolean;
}

export function initLemonsqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey || apiKey.length === 0) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set");
  }
  lemonSqueezySetup({ apiKey });
}

export const PLANS: Record<string, LemonsqueezyPlan> = {
  free: {
    name: "Free",
    variantId: "",
    price: 0,
    resumesPerMonth: 1,
    coverLetters: false,
    watermark: true,
    atsOptimization: false,
  },
  pro: {
    name: "Pro",
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "",
    price: 9,
    resumesPerMonth: -1,
    coverLetters: true,
    watermark: false,
    atsOptimization: true,
  },
  lifetime: {
    name: "Lifetime",
    variantId: process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID || "",
    price: 29,
    resumesPerMonth: -1,
    coverLetters: true,
    watermark: false,
    atsOptimization: true,
  },
};

export type PlanType = keyof typeof PLANS;

export function getStoreId(): string {
  return process.env.LEMONSQUEEZY_STORE_ID || "358083";
}

/**
 * Verify a LemonSqueezy webhook signature.
 * Returns true if the signature is valid, false otherwise.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(digest, "hex"));
}

export { createCheckout };

/* ------------------------------------------------------------------ */
/*  Webhook payload helpers                                           */
/* ------------------------------------------------------------------ */

/**
 * LemonSqueezy webhook payloads use snake_case attributes.
 * These helpers extract common fields safely.
 */
export function getWebhookEventName(payload: Record<string, unknown>): string | undefined {
  return ((payload.meta as Record<string, unknown> | undefined)?.event_name as string) ?? undefined;
}

export function getWebhookAttributes(payload: Record<string, unknown>): Record<string, unknown> | undefined {
  return ((payload.data as Record<string, unknown> | undefined)?.attributes as Record<string, unknown>) ?? undefined;
}
