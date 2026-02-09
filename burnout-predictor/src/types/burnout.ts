export type NumericFeature =
  | "avgHoursPerWeek"
  | "overtimeHours"
  | "mentalFatigueScore"
  | "resourceAllocation"
  | "projectComplexity"
  | "sleepQuality"
  | "jobSatisfaction"
  | "workLifeBalance"
  | "managerSupport"
  | "recentLeaves"
  | "tenureYears"
  | "age"
  | "stressLevel"
  | "peerSupport"
  | "physicalActivity";

export type CategoricalFeature =
  | "department"
  | "role"
  | "workLocation"
  | "wfhSetup"
  | "gender";

export interface BurnoutFeatures {
  avgHoursPerWeek: number;
  overtimeHours: number;
  mentalFatigueScore: number;
  resourceAllocation: number;
  projectComplexity: number;
  sleepQuality: number;
  jobSatisfaction: number;
  workLifeBalance: number;
  managerSupport: number;
  recentLeaves: number;
  tenureYears: number;
  age: number;
  stressLevel: number;
  peerSupport: number;
  physicalActivity: number;
  department: string;
  role: string;
  workLocation: string;
  wfhSetup: string;
  gender: string;
}

export interface BurnoutRecord extends BurnoutFeatures {
  employeeId: string;
  burnoutScore: number;
}

export interface FeatureMetric {
  id: string;
  label: string;
  description: string;
  value: number;
  change: number;
  icon: string;
}
