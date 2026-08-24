import { useMemo } from "react";
import type { ProfileCompletionResult, CandidateProfileSummary } from "../types";
import { calculateProfileCompletion } from "../profileCompletion";

export { calculateProfileCompletion } from "../profileCompletion";

export function useProfileCompletion(summary: CandidateProfileSummary): ProfileCompletionResult {
  return useMemo(() => calculateProfileCompletion(summary), [summary]);
}
