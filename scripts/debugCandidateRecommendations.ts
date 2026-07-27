import "dotenv/config";
import { supabase } from "@/integrations/supabase/client";

async function main() {
  const candidateId = process.argv[2] || process.env.CANDIDATE_ID;
  if (!candidateId) {
    console.error("Usage: tsx scripts/debugCandidateRecommendations.ts <candidateId>");
    process.exit(1);
  }

  console.log(`Checking candidate ${candidateId}...`);

  try {
    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .select("id, cv_text, cv_url, embedding_vector")
      .eq("id", candidateId)
      .single();

    if (candErr) {
      console.error("Error fetching candidate:", candErr.message);
    } else {
      console.log("Candidate row:", {
        id: candidate?.id,
        cv_text_length: candidate?.cv_text ? candidate.cv_text.length : 0,
        cv_url: candidate?.cv_url,
        has_embedding: Boolean(candidate?.embedding_vector),
      });
    }

    console.log("Calling RPC match_job_offers_for_candidate...");
    const { data: rpcData, error: rpcErr } = await supabase.rpc("match_job_offers_for_candidate", {
      candidate_id: candidateId,
      match_threshold: 0.2,
      match_count: 6,
      match_offset: 0,
    });

    if (rpcErr) {
      console.error("RPC error:", rpcErr.message, rpcErr.details || "");
    } else {
      console.log(`RPC returned ${Array.isArray(rpcData) ? rpcData.length : 0} rows`);
      if (Array.isArray(rpcData) && rpcData.length > 0) {
        console.log("Sample result:", JSON.stringify(rpcData.slice(0, 3), null, 2));
      }
    }

    // Check job_offers missing embeddings
    const { data: missing, error: missErr } = await supabase
      .from("job_offers")
      .select("id, title")
      .is("embedding_vector", null)
      .limit(10);

    if (missErr) {
      console.error("Error checking job_offers embeddings:", missErr.message);
    } else {
      console.log(`Found ${missing?.length ?? 0} job_offers with NULL embedding_vector (showing up to 10):`);
      console.log(missing);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
