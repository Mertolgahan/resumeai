import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, PlanType } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") as PlanType;

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

    const session = await stripe.checkout.sessions.create({
      mode: plan === "lifetime" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return NextResponse.redirect(session.url || "/");
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}