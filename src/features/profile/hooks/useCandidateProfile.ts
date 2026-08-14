/**
 * useCandidateProfile: Convenience wrapper for useCandidate
 * 
 * This is a light wrapper for backward compatibility.
 * New code should import useCandidate directly from:
 *   @/features/candidates/hooks/useCandidate
 * 
 * Returns the same data as useCandidate() without any additional logic.
 */
import { useCandidate } from "@/features/candidates/hooks/useCandidate";

export function useCandidateProfile() {
  return useCandidate();
}
