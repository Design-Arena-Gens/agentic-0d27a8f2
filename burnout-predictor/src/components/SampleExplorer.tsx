"use client";

import { useMemo, useState } from "react";
import { sampleRecords } from "@/lib/sampleData";
import type { BurnoutRecord } from "@/types/burnout";
import { computeModelHealth } from "@/lib/model";

const headers: (keyof BurnoutRecord)[] = [
  "employeeId",
  "department",
  "role",
  "avgHoursPerWeek",
  "mentalFatigueScore",
  "resourceAllocation",
  "workLifeBalance",
  "stressLevel",
  "burnoutScore",
];

export function SampleExplorer() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) {
      return sampleRecords;
    }
    const normalised = search.toLowerCase();
    return sampleRecords.filter((row) =>
      row.employeeId.toLowerCase().includes(normalised) ||
      row.department.toLowerCase().includes(normalised) ||
      row.role.toLowerCase().includes(normalised)
    );
  }, [search]);

  const health = computeModelHealth(filtered);

  return (
    <section id="explore" className="glass-panel p-8 lg:p-10">
      <div className="flex flex-col gap-3 pb-6">
        <h2 className="section-title">Feature Store Snapshot</h2>
        <p className="muted max-w-3xl">
          Explore the anonymised wellbeing cohort bundled with the starter kit. Replace this dataset with the competition files to activate the full training pipeline.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 pb-5">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by employee ID, department, or role"
          className="w-full rounded-2xl border border-slate-700/40 bg-slate-950/50 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 sm:max-w-md"
        />
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
          Cohort Mean: <span className="text-emerald-300">{health.mean}</span>{" "}
          · Drift Guardrail: {health.thresholdLow} – {health.thresholdHigh}
        </div>
      </div>
      <div className="overflow-auto rounded-2xl border border-slate-700/40">
        <table className="min-w-full divide-y divide-slate-700/60 text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-100">
            {filtered.map((row) => (
              <tr key={row.employeeId} className="hover:bg-slate-900/60">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3">
                    {typeof row[header] === "number"
                      ? (row[header] as number).toFixed(2)
                      : (row[header] as string)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-100"
        href="/data/sample_records.json"
        download
      >
        Download Sample CSV Extract →
      </a>
    </section>
  );
}
