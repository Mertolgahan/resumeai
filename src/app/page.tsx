import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  FileText,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in">
                <Sparkles className="h-4 w-4" />
                AI-Powered Resume Builder
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up">
                Your Dream Job Starts
                <br />
                <span className="text-primary">With the Perfect Resume</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted animate-slide-up">
                Create professional, ATS-optimized resumes and cover letters in
                seconds. Our AI crafts compelling narratives from your experience
                that get you noticed.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up">
                <Link
                  href="/dashboard"
                  id="try-free"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
                >
                  Try Free — No Signup Required
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted-bg"
                >
                  View Pricing
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Free tier available
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  ATS-optimized
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  No credit card needed
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted">
              Three steps to your perfect resume
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Input Your Info</h3>
              <p className="mt-2 text-muted">
                Enter your work experience, education, and skills. Our smart form
                makes it quick and easy.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">AI Generates</h3>
              <p className="mt-2 text-muted">
                Our AI crafts compelling bullet points, a professional summary,
                and optimized content tailored to your target role.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Star className="h-7 w-7 text-success" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Download & Apply</h3>
              <p className="mt-2 text-muted">
                Download your polished resume as a PDF and start applying with
                confidence. ATS-friendly formatting guaranteed.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-muted-bg py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Why ResumeAI?
              </h2>
              <p className="mt-4 text-lg text-muted">
                Built by job seekers, for job seekers
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-background p-6 shadow-sm">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">
                  Ready in 30 Seconds
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Generate a complete, professional resume from your inputs in
                  under a minute.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">ATS-Optimized</h3>
                <p className="mt-2 text-sm text-muted">
                  Resumes formatted specifically to pass Applicant Tracking
                  Systems used by 98% of Fortune 500.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <Target className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">Role-Targeted</h3>
                <p className="mt-2 text-sm text-muted">
                  AI tailors your resume for specific job titles and industries
                  for maximum impact.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">
                  Cover Letters Too
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Generate matching cover letters personalized for each
                  application with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Start Building Your Resume Now
            </h2>
            <p className="mt-4 text-lg text-muted">
              Free resume generation — no signup, no credit card, no catch.
              Upgrade to Pro for unlimited resumes and cover letters.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
              >
                Create My Resume
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-muted-bg py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <div className="mt-12 space-y-6">
              <div className="rounded-xl bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  Is ResumeAI really free?
                </h3>
                <p className="mt-2 text-muted">
                  Yes! You can generate one resume completely free, no credit
                  card required. Upgrade to Pro for unlimited resumes, cover
                  letters, and ATS optimization.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  What makes it ATS-friendly?
                </h3>
                <p className="mt-2 text-muted">
                  Our AI structures your resume with clean formatting, proper
                  headings, and keyword optimization that Applicant Tracking
                  Systems can easily parse and rank highly.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  How does the AI generate my resume?
                </h3>
                <p className="mt-2 text-muted">
                  We use advanced AI to transform your work experience into
                  compelling, action-oriented bullet points with quantifiable
                  achievements — the format hiring managers and ATS systems
                  prefer.
                </p>
              </div>

              <div className="rounded-xl bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  Can I edit the AI-generated resume?
                </h3>
                <p className="mt-2 text-muted">
                  Absolutely! The AI gives you a strong starting point, and you
                  can customize every section before downloading. Pro users get
                  unlimited edits and regenerations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}