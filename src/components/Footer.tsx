import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span>
                Resume<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              AI-powered resume and cover letter builder. Land your dream job
              faster with professionally crafted, ATS-optimized documents.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cover Letter Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://producthunt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Product Hunt
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="#privacy"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}