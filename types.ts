export type Sex = 'male' | 'female';
export type Alcohol = 'none' | 'moderate' | 'heavy';
export type Smoking = 'never' | 'past' | 'current';
export type Exercise = 'yes' | 'no';
export type Pylori = 'unknown' | 'negative' | 'eradicated' | 'current';
export type Polypharmacy = '0' | '1-4' | '5+';

export interface UserData {
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  alcohol: Alcohol;
  smoking: Smoking;
  exercise: Exercise;
  pylori: Pylori;
  polypharmacy: Polypharmacy;
  fam_cancer: boolean;
  parent_long: boolean;
  allergy: boolean;
  hist_cancer: boolean;
  hist_stroke: boolean;
  hist_heart: boolean;
  dm: boolean;
  htn: boolean;
  dl: boolean;
  inf_hep: boolean;
  inf_hpv: boolean;
}

export interface SimulationResult {
  le: number; // Life Expectancy (remaining years)
  lifespan: number; // Total expected age
  median: number; // Median age
  diff: number; // Difference from average
  official: number; // Official avg remaining years
  curve: { age: number; survival: number; avgSurvival: number }[];
  economic: {
    currentLoss: number;
    potentialGain: number;
    workYearsAvg: number;
    workYearsCurrent: number;
  };
  factors: { label: string; hr: number; impact: number }[];
}