import { useEffect, useState } from "react";
import { getCandidateSavedOffers, saveJobOffer, unsaveJobOffer } from "@/features/candidates/api/savedOffersApi";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";

export function useCandidateSavedOffers() {
  const { profile } = useCandidate();
  const [savedOffers, setSavedOffers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    let mounted = true;
    setLoading(true);
    void (async () => {
      try {
        const data = await getCandidateSavedOffers(profile.id);
        if (mounted) setSavedOffers(data || []);
      } catch (e) {
        console.error("Failed to load saved offers", e);
        if (mounted) setSavedOffers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  return { savedOffers, loading, saveJobOffer, unsaveJobOffer };
}
