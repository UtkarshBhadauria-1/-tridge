/**
 * TRIDGE - Scheme and Citizen Profile Data Models
 */

export interface CitizenProfile {
  state: string;
  district: string;
  educationLevel: string; // e.g. "Undergraduate/College", "12th Pass", "10th Pass", "Below 10th", "Postgraduate"
  occupation: string; // e.g. "College Student", "Small/Marginal Farmer", "Agricultural Laborer", "Artisan", "Unemployed Youth"
  annualIncome: number; // in INR, e.g. 180000
  socialCategory: string; // "General" | "OBC" | "SC" | "ST" | "EWS" | "Minority"
  gender: string; // "Female" | "Male" | "Other"
  landholding: string; // "Landless" | "Marginal (< 1 hectare)" | "Small (1-2 ha)" | "Medium/Large (> 2 ha)"
  isDifferentlyAbled: boolean;
}

export type EligibilityVerdict =
  | 'potentially_eligible'
  | 'not_eligible'
  | 'more_info_required';

export interface EligibilityMatchResult {
  verdict: EligibilityVerdict;
  verdictLabel: string;
  matchedCriteria: string[];
  unmetCriteria: string[];
  uncertainCriteria: string[];
  explanation: string;
  disclaimer: string;
}

export interface SchemeDeadlineInfo {
  dateText: string; // e.g. "31 December 2026", "Open throughout the year", "Uncertain / Not specified"
  isUncertain: boolean;
  uncertaintyMessage?: string;
  status: 'active' | 'expired' | 'ongoing' | 'uncertain';
}

export interface Scheme {
  id: string;
  name: string;
  department: string;
  description: string;
  benefits: string[];
  eligibilityCriteria: string[];
  targetStates?: string[]; // e.g. ["Uttar Pradesh", "All India"]
  targetOccupations?: string[];
  targetEducation?: string[];
  incomeLimitINR?: number | null; // e.g. 250000
  socialCategoriesAllowed?: string[]; // e.g. ["SC", "ST", "OBC", "General"]
  genderTarget?: 'All' | 'Female' | 'Male';
  deadline: SchemeDeadlineInfo;
  requiredDocuments: string[];
  sourceUrl: string;
  retrievalTimestamp: string;
  verificationNotes?: string[];
  uncertaintyDisclaimers?: string[];
  eligibilityMatch?: EligibilityMatchResult;
  lastComparedTimestamp?: string;
  hasUpdatesNotice?: boolean;
}

export interface SchemeChangeDiff {
  field: 'deadline' | 'eligibility' | 'benefits' | 'documents' | 'description';
  fieldName: string;
  previousValue: string;
  newValue: string;
  changeType: 'modified' | 'added' | 'removed' | 'extended' | 'expired';
  supportingSourceUrl: string;
  notes: string;
}

export interface ChangeRecord {
  schemeId: string;
  schemeName: string;
  previousTimestamp: string;
  newTimestamp: string;
  hasChanges: boolean;
  differences: SchemeChangeDiff[];
  summary: string;
}

export interface MultilingualExplanation {
  language: string;
  languageName: string;
  whatIsIt: string;
  whoIsEligible: string;
  whatYouReceive: string;
  importantDatesAndDeadlines: string;
  documentsNeeded: string;
  criticalConditionsAndWarnings: string;
  sourceUrl: string;
  disclaimer: string;
}

export interface TinyFishSearchResultItem {
  title: string;
  url: string;
  snippet?: string;
  markdown?: string;
  score?: number;
}
