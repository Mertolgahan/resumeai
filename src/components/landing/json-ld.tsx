const faqData = [
  {
    question: "What is ContentAI?",
    answer: "ContentAI is an AI-powered content generation platform that helps you create SEO-optimized blog posts, social media content, product descriptions, email campaigns, ad copy, and more — in seconds.",
  },
  {
    question: "How does the free plan work?",
    answer: "The free plan gives you 10 AI content generations per day and 100 per month. No credit card required. Sign up and start creating immediately.",
  },
  {
    question: "What content types can I generate?",
    answer: "ContentAI supports 7 content types: Blog Posts, Social Media Posts, SEO Titles, SEO Meta Descriptions, Product Descriptions, Email Campaigns, and Ad Copy.",
  },
  {
    question: "What AI models does ContentAI use?",
    answer: "ContentAI uses a smart dual-provider system with Ollama (self-hosted models) and OpenRouter (cloud AI models) with automatic fallback for maximum uptime.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time through the billing dashboard. You'll have access until the end of your billing period. No long-term contracts.",
  },
  {
    question: "Do I own the content I generate?",
    answer: "Absolutely. Any content you generate with ContentAI is yours to use however you like — publish it, modify it, sell it, or distribute it. No attribution required.",
  },
  {
    question: "Can I use ContentAI for commercial projects?",
    answer: "Yes! All plans, including the free tier, allow commercial use. Starter and higher plans include API access for integration into your own applications.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "You'll receive a notification when you approach your limits. Once reached, you'll need to upgrade or wait for your daily/monthly limit to reset. No surprise charges.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee on all paid plans. If ContentAI doesn't meet your expectations, contact us for a full refund — no questions asked.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All data is stored securely in Supabase with row-level security. Your content generations are private to your account. We never use your content to train AI models.",
  },
];

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://the-exp.net";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ContentAI",
    url: baseUrl,
    description:
      "AI-powered content generation platform for SEO-optimized blog posts, social media, product descriptions, and more.",
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ContentAI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description:
      "AI-powered content generation platform. Create SEO blog posts, social media content, product descriptions, email campaigns, and ad copy in seconds.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "10 generations per day, 100 per month.",
      },
      {
        "@type": "Offer",
        name: "Starter",
        price: "9",
        priceCurrency: "USD",
        description: "100 generations/day, 3,000/month, 5 projects.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "29",
        priceCurrency: "USD",
        description:
          "1,000 generations/day, 30,000/month, 25 projects, API access.",
      },
      {
        "@type": "Offer",
        name: "Enterprise",
        price: "99",
        priceCurrency: "USD",
        description: "Unlimited generations, unlimited projects, SLA guarantee.",
      },
    ],
    featureList: [
      "Blog Post Generator",
      "Social Media Content",
      "SEO Title & Meta Generator",
      "Product Description Writer",
      "Email Campaign Creator",
      "Ad Copy Generator",
      "Real-Time Streaming",
      "AI Provider Fallback",
      "Usage Analytics Dashboard",
      "Generation History",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
