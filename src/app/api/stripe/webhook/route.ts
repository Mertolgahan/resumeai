import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer as string;
        const customerEmail = session.customer_email;

        console.log(
          `Checkout completed: ${customerEmail} (${customerId})`
        );

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(
          `Subscription updated: ${subscription.id} - ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log(
          `Subscription canceled: ${subscription.id}`
        );
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log(
          `Invoice paid: ${invoice.id}`
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(
          `Invoice payment failed: ${invoice.id}`
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}