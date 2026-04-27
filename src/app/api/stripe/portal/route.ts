import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await getSupabaseAdmin()
      .from("users")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single();

    if (!user?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      );
    }

    const portalSession = await createBillingPortalSession({
      customerId: user.stripe_customer_id,
      returnUrl: `${env.NEXTAUTH_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}