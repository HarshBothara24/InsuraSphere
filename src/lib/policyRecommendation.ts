import { Policy } from '../types/policy';

interface UserPreferences {
  age: number;
  income: number;
  occupation: string;
  familySize: number;
  existingPolicies: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  goals: string[];
}

// Simulated feature importance scores (would come from trained model)
const FEATURE_WEIGHTS = {
  age: 0.15,
  income: 0.2,
  occupation: 0.1,
  familySize: 0.15,
  existingPolicies: 0.1,
  riskTolerance: 0.15,
  goals: 0.15,
};

export class PolicyRecommendationEngine {
  private calculateAgeScore(age: number, policy: Policy): number {
    const ageRanges = {
      'Life Insurance': { ideal: [25, 50], weight: 1 },
      'Health Insurance': { ideal: [18, 70], weight: 0.8 },
      'Vehicle Insurance': { ideal: [18, 70], weight: 0.6 },
      'Property Insurance': { ideal: [25, 60], weight: 0.7 },
    };

    const policyRange = ageRanges[policy.type as keyof typeof ageRanges];
    if (!policyRange) return 0.5;

    const [min, max] = policyRange.ideal;
    if (age >= min && age <= max) return 1 * policyRange.weight;
    return 0.3 * policyRange.weight;
  }

  private calculateIncomeScore(income: number, policy: Policy): number {
    const premiumRatio = policy.premium / income;
    if (premiumRatio <= 0.1) return 1;
    if (premiumRatio <= 0.2) return 0.7;
    if (premiumRatio <= 0.3) return 0.4;
    return 0.2;
  }

  private calculateOccupationScore(occupation: string, policy: Policy): number {
    const occupationRisks = {
      'office worker': { risk: 'low', score: 0.8 },
      'driver': { risk: 'high', score: 1 },
      'doctor': { risk: 'medium', score: 0.9 },
      'construction': { risk: 'high', score: 1 },
      'teacher': { risk: 'low', score: 0.7 },
      'other': { risk: 'medium', score: 0.8 },
    };

    const risk = occupationRisks[occupation as keyof typeof occupationRisks] || occupationRisks.other;
    return risk.score;
  }

  private calculateFamilySizeScore(familySize: number, policy: Policy): number {
    if (policy.type === 'Health Insurance' || policy.type === 'Life Insurance') {
      return familySize > 1 ? 1 : 0.5;
    }
    return 0.7;
  }

  private calculateGoalsScore(userGoals: string[], policy: Policy): number {
    if (!policy.goals || !policy.goals.length) return 0.5;
    const matchingGoals = policy.goals.filter(goal => userGoals.includes(goal));
    return matchingGoals.length / Math.max(userGoals.length, policy.goals.length);
  }

  private calculateRiskScore(riskTolerance: string, policy: Policy): number {
    const riskScores = {
      low: { premium: 0.8, coverage: 0.4 },
      medium: { premium: 0.6, coverage: 0.6 },
      high: { premium: 0.4, coverage: 0.8 },
    };

    const score = riskScores[riskTolerance as keyof typeof riskScores] || riskScores.medium;
    const premiumScore = policy.premium < 50000 ? score.premium : 1 - score.premium;
    const coverageScore = policy.coverage > 1000000 ? score.coverage : 1 - score.coverage;
    
    return (premiumScore + coverageScore) / 2;
  }

  public recommendPolicies(preferences: UserPreferences, availablePolicies: Policy[]): Policy[] {
    const scoredPolicies = availablePolicies.map(policy => {
      const ageScore = this.calculateAgeScore(preferences.age, policy) * FEATURE_WEIGHTS.age;
      const incomeScore = this.calculateIncomeScore(preferences.income, policy) * FEATURE_WEIGHTS.income;
      const occupationScore = this.calculateOccupationScore(preferences.occupation, policy) * FEATURE_WEIGHTS.occupation;
      const familyScore = this.calculateFamilySizeScore(preferences.familySize, policy) * FEATURE_WEIGHTS.familySize;
      const goalsScore = this.calculateGoalsScore(preferences.goals, policy) * FEATURE_WEIGHTS.goals;
      const riskScore = this.calculateRiskScore(preferences.riskTolerance, policy) * FEATURE_WEIGHTS.riskTolerance;

      const totalScore = (
        ageScore +
        incomeScore +
        occupationScore +
        familyScore +
        goalsScore +
        riskScore
      ) / Object.values(FEATURE_WEIGHTS).reduce((a, b) => a + b, 0);

      return {
        ...policy,
        matchScore: totalScore,
      };
    });

    return scoredPolicies
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 5);
  }
} 