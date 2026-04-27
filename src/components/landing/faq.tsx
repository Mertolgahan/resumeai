"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is ContentAI?",
    a: "ContentAI is an AI-powered content generation platform that helps you create SEO-optimized blog posts, social media content, product descriptions, email campaigns, ad copy, and more — in seconds.",
  },
  {
    q: "How does the free plan work?",
    a: "The free plan gives you 10 AI content generations per day and 100 per month. No credit card required. You can create an account and start generating content immediately.",
  },
  {
    q: "What content types are supported?",
    a: "ContentAI supports 7 content types: Blog Posts, Social Media Posts, SEO Titles, SEO Meta Descriptions, Product Descriptions, Email Campaigns, and Ad Copy. Each type uses an optimized AI prompt for best results.",
  },
  {
    q: "What AI models does ContentAI use?",
    a: "ContentAI uses a smart dual-provider system with Ollama (self-hosted models) and OpenRouter (cloud AI models). If one provider is unavailable, it automatically falls back to the other, ensuring maximum uptime.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time through the billing dashboard. You'll continue to have access until the end of your current billing period. No long-term contracts.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is stored securely in Supabase with row-level security. Your content generations are private to your account. We never use your generated content to train AI models.",
  },
  {
    q: "Do I own the content I generate?",
    a: "Absolutely. Any content you generate with ContentAI is yours to use however you like — publish it, modify it, sell it, or distribute it. No attribution required.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "You'll receive a friendly notification when you approach your limits. Once reached, you'll need to upgrade your plan or wait for your daily/monthly limit to reset. We never charge you unexpectedly.",
  },
  {
    q: "Can I use ContentAI for commercial projects?",
    a: "Yes! All plans, including the free tier, allow you to use generated content for commercial purposes. Starter and higher plans include API access for integration into your own applications.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 14-day money-back guarantee on all paid plans. If ContentAI doesn't meet your expectations, contact us for a full refund — no questions asked.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container mx-auto max-w-3xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 text-lg text-muted-foreground">
          Everything you need to know about ContentAI.
        </p>
      </div>
      <div className="mt-12 space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border">
      <button
        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium sm:text-base"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {question}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-t px-4 py-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}