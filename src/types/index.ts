export interface YoutubeAnalysis {
  videoId: string;
  title: string;
  url: string;
  summary: string;
  keyPoints: string[];
  loanStrategies: string[];
  warnings: string[];
  transcript?: string;
}

export interface LoanProfile {
  // 기본 정보
  age: number;
  occupation: string;
  annualIncome: number;
  hasSpouse: boolean;
  spouseIncome?: number;
  dependents: number;

  // 금융 정보
  creditScore: number;
  existingLoan: number;
  carLoan: number;
  cardLoan: number;
  minusAccount: number;

  // 주택 정보
  targetRegion: string;
  propertyPrice: number;
  isResidence: boolean;
  isFirstTimeBuyer: boolean;
  isHouseless: boolean;
}

export interface LoanAnalysis {
  ltv: number;
  dti: number;
  dsr: number;
  maxLoanAmount: number;
  estimatedRate: { min: number; max: number };
  monthlyPayment: number;
  totalInterest: number;
  approvalProbability: number;
  issues: LoanIssue[];
  improvements: LoanImprovement[];
  roadmap: RoadmapStep[];
  governmentLoans: GovernmentLoan[];
}

export interface LoanIssue {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface LoanImprovement {
  action: string;
  effect: string;
  estimatedIncrease: number;
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

export interface GovernmentLoan {
  name: string;
  maxAmount: number;
  maxRate: number;
  eligible: boolean;
  eligibilityReason?: string;
  priority: number;
}

export interface SimulationResult {
  years: number;
  method: 'equal-principal-interest' | 'equal-principal' | 'bullet';
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
