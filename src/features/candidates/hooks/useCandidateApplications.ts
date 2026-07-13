import { useEffect, useState } from "react";
import { getCandidateApplications, applyToJob, withdrawApplication } from "@/features/candidates/api/applicationsApi";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";

export function useCandidateApplications() {
  const { profile } = useCandidate();
  const [applications, setApplications] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    let mounted = true;
    setLoading(true);
    void (async () => {
      try {
        const data = await getCandidateApplications(profile.id);
        if (mounted) setApplications(data || []);
      } catch (e) {
        console.error("Failed to load applications", e);
        if (mounted) setApplications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  return { applications, loading, applyToJob, withdrawApplication };
}
