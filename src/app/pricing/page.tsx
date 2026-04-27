import { Pricing } from "@/components/landing/pricing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Pricing — ContentAI | AI Content Generation Plans",
  description:
    "Simple, transparent pricing for ContentAI. Start free with 10 generations per day. Upgrade to Starter ($9/mo), Pro ($29/mo), or Enterprise ($99/mo) for more.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}