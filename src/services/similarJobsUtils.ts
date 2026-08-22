import type { JobOffer } from "@/features/jobs/types";

export type JobActivitySnapshot = Pick<JobOffer, "status" | "deadline" | "expires_at" | "publish_at">;

export function getJobDeadlineValue(job: JobActivitySnapshot): string | null {
  return job.expires_at || job.deadline || job.publish_at || null;
}

export function isJobActive(job: JobActivitySnapshot, includeExpired = false): boolean {
  if (job.status === "archived") {
    return false;
  }

  if (job.status === "expired") {
    return includeExpired;
  }

  const deadlineValue = getJobDeadlineValue(job);
  if (!deadlineValue) {
    return job.status === "published";
  }

  const deadline = new Date(deadlineValue).getTime();
  if (Number.isNaN(deadline)) {
    return job.status === "published";
  }

  return job.status === "published" && deadline > Date.now();
}
