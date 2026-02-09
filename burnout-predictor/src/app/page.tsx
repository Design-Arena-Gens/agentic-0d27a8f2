import Link from "next/link";
import { PredictionForm } from "@/components/PredictionForm";
import { MetricsRow } from "@/components/MetricsRow";
import { SampleExplorer } from "@/components/SampleExplorer";
import { defaultFeaturePayload, featureOrdering, leaderboardHighlights } from "@/lib/featureMetadata";

const playbookSteps = [
  {
    title: "Acquire & Profile Data",
    description:
      "Download the official InsightML #2 dataset, drop it into the data/ directory, and run profiling notebooks to validate schema assumptions.",
  },
  {
    title: "Feature Engineering",
    description:
      "Construct wellbeing signals (burnout accelerators, resilience buffers, support indicators) using reusable transformation pipelines.",
  },
  {
    title: "Model Training",
    description:
      "Stack gradient boosted decision trees with linear debiasing layers. Optimise with RMSE-driven Optuna search and stratified CV.",
  },
  {
    title: "Inference & Monitoring",
    description:
      "Deploy the TypeScript regression core on Vercel, capture telemetry, and run nightly drift checks against validation cohorts.",
  },
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a55,transparent_55%)]" />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16 lg:px-10 lg:py-20">
        <header className="glass-panel relative overflow-hidden px-8 py-14 lg:px-12">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-500/20 to-transparent blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              InsightML #2 · Burnout Score
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A full-stack intelligence workspace for employee burnout prediction.
            </h1>
            <p className="muted max-w-3xl text-lg">
              Ship Kaggle-ready submissions, analyse wellbeing drivers, and deploy production-grade inference powered by a deterministic TypeScript core and Python feature engineering toolkit.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#predict"
                className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
              >
                Launch Predictor
              </Link>
              <Link
                href="#pipeline"
                className="rounded-2xl border border-slate-600/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-300/60"
              >
                Review Pipeline
              </Link>
              <span className="text-xs uppercase tracking-widest text-slate-400">
                RMSE-optimised · Vercel-ready · SSAE compliant
              </span>
            </div>
          </div>
        </header>

        <MetricsRow />

        <section
          id="pipeline"
          className="glass-panel grid gap-8 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] lg:p-10"
        >
          <div className="flex flex-col gap-5">
            <h2 className="section-title">Competition Starter Playbook</h2>
            <p className="muted max-w-2xl">
              The repository bundles a production-ready Next.js app, TypeScript-based inference layer, and Python training scripts.
              Follow the orchestrated pipeline to replicate leaderboard results and maintain reliable deployments.
            </p>
            <div className="space-y-5">
              {playbookSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-slate-700/40 bg-slate-900/30 p-5"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300/80">
                    Step {index + 1}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="flex flex-col gap-5 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-blue-500/10 p-6">
            <h3 className="text-lg font-semibold text-slate-100">
              Feature Blueprint
            </h3>
            <p className="text-sm leading-relaxed text-slate-300/90">
              Curated feature groups capture both risk accelerators and recovery buffers. Swap them seamlessly inside the TypeScript regression core or Python notebooks.
            </p>
            <ul className="grid grid-cols-2 gap-3 text-sm text-slate-200">
              {featureOrdering.map((feature) => (
                <li
                  key={feature}
                  className="rounded-xl border border-slate-600/40 bg-slate-900/40 px-3 py-2 text-center"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <SampleExplorer />

        <PredictionForm defaultValues={defaultFeaturePayload} />

        <section className="glass-panel p-8 lg:p-10">
          <div className="flex flex-col gap-4 pb-6">
            <h2 className="section-title">Model Governance Highlights</h2>
            <p className="muted max-w-3xl">
              Insights distilled from validation experiments, fairness probes, and monitoring dashboards. These techniques are encoded in the Python notebooks and automated checks.
            </p>
          </div>
          <div className="grid-auto-fit">
            {leaderboardHighlights.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-6"
              >
                <h3 className="text-xl font-semibold text-slate-100">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm text-slate-400">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mb-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>ABES InsightML #2 · Burnout Prediction Suite</span>
          <div className="flex gap-2">
            <Link href="https://kaggle.com/competitions/predicting-employee-burnout-score-using-machine-learning" target="_blank" className="hover:text-slate-200">
              Kaggle Competition
            </Link>
            <Link href="https://vercel.com" target="_blank" className="hover:text-slate-200">
              Vercel Deployment
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
