import {
  Header,
  Hero,
  Stats,
  Features,
  HowItWorks,
  Pricing,
  FAQ,
  CTA,
  Footer,
  JsonLd,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd />
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}