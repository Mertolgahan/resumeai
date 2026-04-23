import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
              <h2 className="text-lg font-semibold">Free</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted">/forever</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Try before you buy — one resume, no signup needed.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  1 resume generation
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  ATS-friendly format
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  Download as text
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/40" />
                  Watermark on PDF
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/40" />
                  No cover letters
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/40" />
                  No ATS optimization
                </li>
              </ul>
              <a
                href="/dashboard"
                className="mt-8 block w-full rounded-full border border-border py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted-bg"
              >
                Get Started Free
              </a>
            </div>

            <div className="relative rounded-2xl border-2 border-primary bg-background p-8 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </div>
              <h2 className="text-lg font-semibold">Pro</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Unlimited resumes and cover letters for job seekers.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Unlimited resume generations
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Cover letter generator
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  No watermark on PDFs
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  ATS optimization
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Role-targeted content
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Priority support
                </li>
              </ul>
              <a
                href="/api/stripe/checkout?plan=pro"
                className="mt-8 block w-full rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Start Pro Trial
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
              <h2 className="text-lg font-semibold">Lifetime</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted">/one-time</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Pay once, use forever. Launch special — first 100 users only.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  Everything in Pro
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  One-time payment, no subscription
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  Lifetime updates
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  Early access to new features
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  Priority support forever
                </li>
              </ul>
              <a
                href="/api/stripe/checkout?plan=lifetime"
                className="mt-8 block w-full rounded-full border border-primary py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Get Lifetime Access
              </a>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-muted">
              All plans include a 14-day money-back guarantee. No questions
              asked.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}