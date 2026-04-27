import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, createCheckoutSession } from "@/lib/stripe";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    let customerId: string;

    const { data: user } = await getSupabaseAdmin()
      .from("users")
      .select("stripe_customer_id, email, name")
      .eq("id", session.user.id)
      .single();

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email || "",
        name: user?.name || undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await getSupabaseAdmin()
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", session.user.id);
    }

    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${env.NEXTAUTH_URL}/dashboard/billing?success=true`,
      cancelUrl: `${env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}