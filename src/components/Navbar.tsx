"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>
            Resume<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <a
            href="#try-free"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Try Free
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <a
              href="#try-free"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Try Free
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}