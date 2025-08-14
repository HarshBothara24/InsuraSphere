export interface Policy {
  type: "Life Insurance" | "Health Insurance" | "Vehicle Insurance" | "Property Insurance";
  id: string;
  name: string;
  description: string;
  premium: number;
  coverage: number;
  term: number;
  benefits: string[];
  goals: string[];
  flexibility?: {
    partialWithdrawal: boolean;
    topUp: boolean;
    premiumHoliday: boolean;
  };
  claimSettlementRatio: number;
  company: string;
  category: string;
  features: string[];
  exclusions: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  age: number;
  income: number;
  occupation: string;
  familySize: number;
  riskTolerance: number;
  goals: string[];
} 