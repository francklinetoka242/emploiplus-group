import type {
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidatePreferences,
  CandidateProfile,
  CandidateSkill,
} from "@/features/candidates/api/types";

export type ProfileTabValue =
  | "profile"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "presentation"
  | "preferences"
  | "documents"
  | "completion";

export interface CompletionItem {
  label: string;
  isCompleted: boolean;
}

export interface ProfileCompletionResult {
  completionPercentage: number;
  missingItems: string[];
  completionItems: CompletionItem[];
}

export interface CandidateProfileSummary {
  profile: CandidateProfile | null;
  experiences: CandidateExperience[];
  educations: CandidateEducation[];
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  preferences: CandidatePreferences | null;
}
