import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or environment variables.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashToken(token: string): number {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash << 5) - hash + token.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function createEmbeddingVectorString(text: string): string {
  const rawTokens = normalizeText(text).match(/[a-z0-9]+/g) ?? [];
  const VECTOR_DIMENSIONS = 768;
  const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);

  if (rawTokens.length > 0) {
    rawTokens.forEach((token, index) => {
      const slot = Math.abs(hashToken(token)) % VECTOR_DIMENSIONS;
      vector[slot] += 1 + (index % 7) / 10;
    });

    const magnitude = Math.hypot(...vector);
    if (magnitude > 0) {
      for (let index = 0; index < vector.length; index += 1) {
        vector[index] = vector[index] / magnitude;
      }
    }
  }

  return `[${vector.map((value) => value.toFixed(6)).join(",")}]`;
}

function buildJobText(job: {
  title?: string | null;
  company?: string | null;
  location_city?: string | null;
  description?: string | null;
  requirements?: string | null;
}): string {
  return [job.title, job.company, job.location_city, job.description, job.requirements]
    .filter(Boolean)
    .join(" ");
}

async function processBatch(from: number, to: number) {
  const { data: jobs, error } = await supabase
    .from("job_offers")
    .select("id,title,company,location_city,description,requirements")
    .is("embedding_vector", null)
    .range(from, to);

  if (error) {
    throw error;
  }

  if (!jobs || jobs.length === 0) {
    return 0;
  }

  let updatedCount = 0;
  for (const job of jobs) {
    if (!job.id) {
      continue;
    }

    const embeddingText = buildJobText(job);
    const embeddingVector = createEmbeddingVectorString(embeddingText);

    const { error: updateError } = await supabase
      .from("job_offers")
      .update({ embedding_vector: embeddingVector })
      .eq("id", job.id);

    if (updateError) {
      console.error(`Failed to update job offer ${job.id}: ${updateError.message}`);
      continue;
    }

    updatedCount += 1;
    console.log(`Updated embedding for job offer ${job.id}`);
  }

  return updatedCount;
}

async function main() {
  console.log("Starting job offer embedding generation...");

  const pageSize = 100;
  let from = 0;
  let totalUpdated = 0;

  while (true) {
    const batchUpdated = await processBatch(from, from + pageSize - 1);
    if (batchUpdated === 0) {
      break;
    }

    totalUpdated += batchUpdated;
    from += pageSize;
  }

  console.log(`Finished generating embeddings for ${totalUpdated} job offers.`);
}

main().catch((error) => {
  console.error("Job offer embedding generation failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
