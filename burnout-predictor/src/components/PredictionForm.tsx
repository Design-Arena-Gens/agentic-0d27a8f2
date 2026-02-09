"use client";

import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { categoricalFeatureMetadata, numericFeatureMetadata } from "@/lib/featureMetadata";
import { computeBurnoutScore, explainContribution } from "@/lib/model";
import type { BurnoutFeatures } from "@/types/burnout";

const validator = z.object({
  avgHoursPerWeek: z.coerce.number().min(20).max(80),
  overtimeHours: z.coerce.number().min(0).max(25),
  mentalFatigueScore: z.coerce.number().min(0).max(10),
  resourceAllocation: z.coerce.number().min(1).max(10),
  projectComplexity: z.coerce.number().min(1).max(5),
  sleepQuality: z.coerce.number().min(1).max(5),
  jobSatisfaction: z.coerce.number().min(1).max(5),
  workLifeBalance: z.coerce.number().min(1).max(5),
  managerSupport: z.coerce.number().min(1).max(5),
  recentLeaves: z.coerce.number().min(0).max(10),
  tenureYears: z.coerce.number().min(0).max(35),
  age: z.coerce.number().min(18).max(65),
  stressLevel: z.coerce.number().min(1).max(5),
  peerSupport: z.coerce.number().min(1).max(5),
  physicalActivity: z.coerce.number().min(0).max(14),
  department: z.string(),
  role: z.string(),
  workLocation: z.string(),
  wfhSetup: z.string(),
  gender: z.string(),
});

type PredictionSchema = z.infer<typeof validator>;

type Props = {
  defaultValues: BurnoutFeatures;
};

export function PredictionForm({ defaultValues }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [attributions, setAttributions] = useState<[string, number][]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PredictionSchema>({
    resolver: zodResolver(validator) as Resolver<PredictionSchema>,
    defaultValues,
  });

  const numericEntries = useMemo(() => {
    return Object.entries(numericFeatureMetadata);
  }, []);

  const categoricalEntries = useMemo(() => {
    return Object.entries(categoricalFeatureMetadata);
  }, []);

  const onSubmit = handleSubmit(async (payload) => {
    const features = payload as BurnoutFeatures;
    const burnoutScore = computeBurnoutScore(features);
    const explanation = explainContribution(features);
    const sorted = [...explanation.entries()]
      .filter(([key]) => key !== "intercept")
      .sort(([, aVal], [, bVal]) => Math.abs(bVal) - Math.abs(aVal))
      .slice(0, 8);
    setScore(burnoutScore);
    setAttributions(sorted);
  });

  const onReset = () => {
    reset(defaultValues);
    setScore(null);
    setAttributions([]);
  };

  return (
    <section id="predict" className="glass-panel p-8 lg:p-10">
      <div className="flex flex-col gap-3 pb-6">
        <h2 className="section-title">Interactive Burnout Score Generator</h2>
        <p className="muted max-w-3xl">
          Adjust the engineered wellbeing signals to simulate the resulting burnout score.
          The deterministic TypeScript regression core mirrors the competition submission pipeline,
          enabling fast experimentation without re-running offline notebooks.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="grid-auto-fit"
      >
        {numericEntries.map(([feature, meta]) => (
          <label
            key={feature}
            className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-700/40 bg-slate-900/35 shadow-inner"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-wide text-slate-400">
                {meta.label}
              </span>
              <span className="text-xs text-slate-500">
                {meta.min} – {meta.max}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              {...register(feature as keyof PredictionSchema, {
                valueAsNumber: true,
              })}
              className={clsx(
                "w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition",
                errors[feature as keyof PredictionSchema]
                  ? "border-red-400/80 focus:border-red-400"
                  : "border-slate-700/40 focus:border-slate-400"
              )}
            />
            <p className="text-xs text-slate-400 leading-relaxed">
              {meta.description}
            </p>
          </label>
        ))}

        {categoricalEntries.map(([feature, meta]) => (
          <label
            key={feature}
            className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-700/40 bg-slate-900/35 shadow-inner"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-wide text-slate-400">
                {meta.label}
              </span>
            </div>
            <select
              {...register(feature as keyof PredictionSchema)}
              className="w-full rounded-xl border border-slate-700/40 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400"
            >
              {meta.options.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 leading-relaxed">
              {meta.description}
            </p>
          </label>
        ))}
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          Generate Score
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-slate-600/60 bg-transparent px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-slate-300/60"
        >
          Reset
        </button>
        {score !== null && (
          <span className="text-lg font-semibold text-slate-50">
            Predicted Burnout Score:{" "}
            <span className="text-emerald-300">{score.toFixed(3)}</span>
          </span>
        )}
      </div>

      {attributions.length > 0 && (
        <div className="mt-8 grid-auto-fit">
          {attributions.map(([feature, value]) => (
            <div
              key={feature}
              className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-5 shadow-inner"
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {feature === "interactionFatigue"
                  ? "Fatigue × Stress"
                  : feature === "interactionSupport"
                  ? "Support Buffer"
                  : feature === "recoverySignal"
                  ? "Recovery Signal"
                  : feature}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">
                {value.toFixed(3)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {value >= 0
                  ? "Positive contribution increases burnout risk."
                  : "Negative contribution dampens burnout risk."}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
