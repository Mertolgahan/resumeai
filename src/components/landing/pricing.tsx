import Link from "next/link";
import { Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try ContentAI with no commitment.",
    features: [
      "10 generations per day",
      "100 generations per month",
      "1 project",
      "Basic AI models",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    description: "For creators who need more power.",
    features: [
      "100 generations per day",
      "3,000 generations per month",
      "5 projects",
      "All AI models",
      "Priority support",
      "Generation history",
    ],
    cta: "Get Starter",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For professionals and growing teams.",
    features: [
      "1,000 generations per day",
      "30,000 generations per month",
      "25 projects",
      "All AI models",
      "Priority support",
      "API access",
      "Custom prompts",
      "Generation history",
    ],
    cta: "Get Pro",
    href: "/signup",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    description: "For teams and agencies at scale.",
    features: [
      "Unlimited generations",
      "Unlimited projects",
      "All AI models",
      "Dedicated support",
      "API access",
      "Custom prompts",
      "Team collaboration",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/signup",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t bg-muted/40">
      <div className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start Free. Scale When Ready.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No credit card required. Start with 10 free generations per day,
            then upgrade for higher limits and more AI models.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg scale-[1.02]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All paid plans include a 14-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </section>
  );
}