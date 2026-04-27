import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sign Up Free",
    description:
      "Create your free account in seconds. No credit card required. Start with 10 free AI content generations per day.",
  },
  {
    number: "02",
    title: "Choose Your Content Type",
    description:
      "Pick from 7 content types — blog posts, social media, SEO titles, product descriptions, email campaigns, ad copy, and SEO meta descriptions.",
  },
  {
    number: "03",
    title: "Generate & Publish",
    description:
      "Enter your prompt, watch the AI stream your content in real time, copy it, and publish. It's that simple.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create Content in 3 Simple Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No complex setup. No AI prompts to learn. Just sign up, pick a
            content type, and let our AI do the heavy lifting.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden translate-x-1/2 sm:block">
                  <ArrowRight className="size-5 text-muted-foreground/40" />
                </div>
              )}
              <div className="text-5xl font-bold text-primary/20">
                {step.number}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}