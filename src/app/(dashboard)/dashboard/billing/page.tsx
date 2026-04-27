"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/stripe";
import { Check } from "lucide-react";

type PaidPlanKey = "starter" | "pro" | "enterprise";

const paidPlans: { key: PaidPlanKey; monthlyPrice: number; yearlyPrice: number }[] = [
  { key: "starter", monthlyPrice: 9, yearlyPrice: 90 },
  { key: "pro", monthlyPrice: 29, yearlyPrice: 290 },
  { key: "enterprise", monthlyPrice: 99, yearlyPrice: 990 },
];

const priceIdMap: Record<PaidPlanKey, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID || "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "",
  },
  enterprise: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || "",
    yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
  },
};

function getCurrentPlanName(subscriptionStatus: string | null | undefined): string {
  if (subscriptionStatus === "active") return "Pro";
  if (subscriptionStatus === "starter" || subscriptionStatus === "pro" || subscriptionStatus === "enterprise") {
    return PLANS[subscriptionStatus]?.name || "Free";
  }
  return "Free";
}

function isPaidPlan(subscriptionStatus: string | null | undefined): boolean {
  return !!subscriptionStatus && subscriptionStatus !== "free";
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(priceId: string, planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const planName = getCurrentPlanName(session?.user?.plan as string);
  const hasActivePlan = isPaidPlan(session?.user?.plan as string);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the {planName} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={hasActivePlan ? "default" : "secondary"}>
              {planName}
            </Badge>
            {hasActivePlan && (
              <Button variant="outline" onClick={handleManage} disabled={loading === "manage"}>
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {paidPlans.map(({ key, monthlyPrice, yearlyPrice }) => {
            const plan = PLANS[key];
            const isPopular = key === "pro";
            return (
              <Card key={key} className={isPopular ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {isPopular && <Badge>Popular</Badge>}
                  </CardTitle>
                  <CardDescription>
                    ${monthlyPrice}/mo or ${yearlyPrice}/yr
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(priceIdMap[key].monthly, key)}
                      disabled={loading !== null || !priceIdMap[key].monthly}
                    >
                      Subscribe Monthly — ${monthlyPrice}/mo
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleUpgrade(priceIdMap[key].yearly, key)}
                      disabled={loading !== null || !priceIdMap[key].yearly}
                    >
                      Subscribe Yearly — ${yearlyPrice}/yr
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}