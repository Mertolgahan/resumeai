import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — SaaSKit Pro | Next.js SaaS Guides & Tutorials",
  description:
    "Practical guides, tutorials, and comparison articles on building SaaS products with Next.js, Stripe, Supabase, and more. Ship faster with battle-tested patterns.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — SaaSKit Pro | Next.js SaaS Guides & Tutorials",
    description:
      "Practical guides, tutorials, and comparison articles on building SaaS products with Next.js, Stripe, Supabase, and more.",
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — SaaSKit Pro | Next.js SaaS Guides & Tutorials",
    description:
      "Practical guides, tutorials, and comparison articles on building SaaS products with Next.js, Stripe, Supabase, and more.",
  },
};

function typeBadgeColor(type: string) {
  switch (type) {
    case "tutorial":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "comparison":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "guide":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            SaaSKit Pro Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Guides, tutorials, and comparisons for building SaaS products with
            Next.js
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColor(post.type)}`}
                >
                  {post.type}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.pubDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Read more <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}