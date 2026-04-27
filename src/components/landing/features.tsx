import {
  FileText,
  Share2,
  Search,
  Package,
  Mail,
  Megaphone,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Globe,
  Layers,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Blog Post Generator",
    description:
      "Generate engaging, SEO-optimized blog posts in seconds. Get well-structured content with headings, paragraphs, and natural keyword placement.",
  },
  {
    icon: Share2,
    title: "Social Media Posts",
    description:
      "Create scroll-stopping social media content with relevant hashtags. Perfect for Twitter, Instagram, LinkedIn, and more.",
  },
  {
    icon: Search,
    title: "SEO Titles & Meta",
    description:
      "Generate compelling SEO titles under 60 characters and meta descriptions under 160 characters that drive clicks.",
  },
  {
    icon: Package,
    title: "Product Descriptions",
    description:
      "Write persuasive product descriptions that highlight features, benefits, and unique selling points to boost conversions.",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description:
      "Craft high-converting email campaigns with strong subject lines, engaging body copy, and clear calls to action.",
  },
  {
    icon: Megaphone,
    title: "Ad Copy",
    description:
      "Create attention-grabbing ad copy with compelling headlines and CTAs. Perfect for Google Ads, Facebook Ads, and more.",
  },
  {
    icon: Zap,
    title: "Real-Time Streaming",
    description:
      "Watch your content appear in real time as the AI generates it. No waiting — see results instantly with SSE streaming.",
  },
  {
    icon: Shield,
    title: "Smart Provider Fallback",
    description:
      "Automatically switches between AI providers for maximum uptime. If one provider is down, another takes over seamlessly.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "Track your daily and monthly generation usage with a clear dashboard. See limits, remaining credits, and plan details.",
  },
  {
    icon: Clock,
    title: "Generation History",
    description:
      "All your past generations are saved and searchable. Filter by content type, copy results, or delete old entries.",
  },
  {
    icon: Globe,
    title: "Multiple AI Models",
    description:
      "Access powerful AI models through Ollama and OpenRouter. Use the best model for each content type automatically.",
  },
  {
    icon: Layers,
    title: "Affordable Plans",
    description:
      "Start free with 10 generations per day. Upgrade to Starter ($9/mo), Pro ($29/mo), or Enterprise ($99/mo) for more.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Create Content
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            7 content types, real-time streaming, smart AI fallback, and
            affordable pricing. ContentAI has everything to scale your content
            creation.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}