import { baselineMetrics } from "@/lib/featureMetadata";

export function MetricsRow() {
  return (
    <section className="grid-auto-fit">
      {baselineMetrics.map((metric) => (
        <article
          key={metric.id}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">{metric.icon}</span>
            <span className="text-xs uppercase text-slate-500">
              {metric.label}
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
            {metric.value.toFixed(3)}
            {metric.id === "throughput" ? " ms" : metric.id === "coverage" ? "" : ""}
          </p>
          <p className="mt-2 text-sm text-slate-400">{metric.description}</p>
          <p className="mt-4 text-xs font-semibold text-emerald-300/80">
            Δ {metric.change > 0 ? "+" : ""}
            {metric.change.toFixed(1)}%
          </p>
        </article>
      ))}
    </section>
  );
}
