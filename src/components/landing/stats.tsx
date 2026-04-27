const stats = [
  { value: "7", label: "Content Types" },
  { value: "<2s", label: "First Token Speed" },
  { value: "10/day", label: "Free Generations" },
  { value: "2", label: "AI Providers (Fallback)" },
];

export function Stats() {
  return (
    <section className="border-y px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary sm:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}