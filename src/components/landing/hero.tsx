import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-4 text-xs">
          <Sparkles className="mr-1 h-3 w-3" />
          AI-Powered Content Generation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Create SEO Content{" "}
          <span className="text-primary">10x Faster</span> with AI
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Generate blog posts, social media content, SEO titles, product
          descriptions, and more. Powered by AI with smart provider fallback.
          Start free, upgrade anytime.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg">Start Creating for Free</Button>
          </Link>
          <Button variant="outline" size="lg" render={<a href="#features" />}>
            See How It Works
          </Button>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            7 Content Types
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Real-Time Streaming
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            No Credit Card Required
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Smart AI Fallback
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Usage Analytics
          </div>
        </div>
      </div>
    </section>
  );
}