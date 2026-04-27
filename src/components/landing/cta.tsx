import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-primary/10 px-6 py-16 text-center sm:px-12 sm:py-20">
        <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start Creating Better Content Today
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Join thousands of creators who use ContentAI to generate SEO-optimized
          blog posts, social media content, and more. Free to start, no credit
          card required.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Free — No Credit Card
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              See All Features
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          10 free generations per day. Upgrade anytime.
        </p>
      </div>
    </section>
  );
}