import { NextResponse } from "next/server";
import { computeBurnoutScore, explainContribution } from "@/lib/model";
import { defaultFeaturePayload } from "@/lib/featureMetadata";
import type { BurnoutFeatures } from "@/types/burnout";
import { z } from "zod";

const featureSchema = z.object({
  avgHoursPerWeek: z.number().min(0).max(100),
  overtimeHours: z.number().min(0).max(40),
  mentalFatigueScore: z.number().min(0).max(10),
  resourceAllocation: z.number().min(0).max(10),
  projectComplexity: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  jobSatisfaction: z.number().min(1).max(5),
  workLifeBalance: z.number().min(1).max(5),
  managerSupport: z.number().min(1).max(5),
  recentLeaves: z.number().min(0).max(15),
  tenureYears: z.number().min(0).max(40),
  age: z.number().min(18).max(70),
  stressLevel: z.number().min(1).max(5),
  peerSupport: z.number().min(1).max(5),
  physicalActivity: z.number().min(0).max(20),
  department: z.string().min(2).max(64),
  role: z.string().min(2).max(64),
  workLocation: z.string().min(2).max(32),
  wfhSetup: z.string().min(2).max(32),
  gender: z.string().min(2).max(32),
});

type PredictPayload = z.infer<typeof featureSchema>;

const sanitizeInput = (payload: Partial<PredictPayload>) => {
  const merged: BurnoutFeatures = {
    ...defaultFeaturePayload,
    ...payload,
  };
  return merged;
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = featureSchema.parse(json);
    const features = sanitizeInput(parsed);
    const burnoutScore = computeBurnoutScore(features);
    const contribution = Object.fromEntries(explainContribution(features));

    return NextResponse.json({
      burnoutScore,
      contribution,
      features,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.issues },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: "Unable to generate prediction" },
      { status: 500 },
    );
  }
}
