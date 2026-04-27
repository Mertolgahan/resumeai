import { NextRequest, NextResponse } from "next/server";
import { initLemonsqueezy, createCheckout, getStoreId, PLANS, PlanType } from "@/lib/lemonsqueezy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") as PlanType;
    const email = searchParams.get("email") || undefined;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'pro' or 'lifetime'." },
        { status: 400 }
      );
    }

    if (plan === "free") {
      return NextResponse.json(
        { error: "Free plan does not require checkout." },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan];

    if (!planConfig.variantId || planConfig.variantId.length === 0) {
      return NextResponse.json(
        { error: "Checkout is not configured for this plan." },
        { status: 500 }
      );
    }

    initLemonsqueezy();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.vercel.app";

    const checkout = await createCheckout(
      getStoreId(),
      planConfig.variantId,
      {
        productOptions: {
          redirectUrl: `${appUrl}/dashboard?success=true`,
          receiptButtonText: "Go to Dashboard",
          receiptLinkUrl: `${appUrl}/dashboard`,
        },
        checkoutOptions: {
          embed: false,
          media: false,
          logo: false,
        },
        checkoutData: {
          email: email || undefined,
          custom: {
            plan,
          },
        },
      }
    );

    if (checkout.error) {
      console.error("LemonSqueezy checkout error:", checkout.error);
      return NextResponse.json(
        { error: "Failed to create checkout session." },
        { status: 500 }
      );
    }

    const redirectUrl = checkout.data?.data?.attributes?.url;
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Checkout URL not available." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("LemonSqueezy checkout error:", message);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
