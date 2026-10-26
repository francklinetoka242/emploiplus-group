import test from "node:test";
import assert from "node:assert/strict";
import { startOfWeek, subWeeks } from "date-fns";
import {
  countApplicationsByStatus,
  groupApplicationsByWeek,
} from "../../src/features/candidates/dashboard/applicationActivity.ts";
import type { CandidateApplicationActivity } from "../../src/features/candidates/api/applicationsApi.ts";

function application(
  id: string,
  appliedAt: string,
  status: CandidateApplicationActivity["status"] = "submitted",
): CandidateApplicationActivity {
  return { id, status, applied_at: appliedAt };
}

test("counts older and withdrawn applications although weekly activity excludes them", () => {
  const applications = [
    application("old-submitted", "2025-01-01T12:00:00.000Z", "submitted"),
    application("reviewed", "2025-02-01T12:00:00.000Z", "reviewed"),
    application("shortlisted", "2025-03-01T12:00:00.000Z", "shortlisted"),
    application("rejected", "2025-04-01T12:00:00.000Z", "rejected"),
    application("accepted", "2025-05-01T12:00:00.000Z", "accepted"),
    application("withdrawn", "2025-06-01T12:00:00.000Z", "withdrawn"),
  ];
  const counts = countApplicationsByStatus(applications);

  assert.deepEqual(counts, {
    submitted: 1,
    reviewed: 1,
    shortlisted: 1,
    rejected: 1,
    accepted: 1,
    withdrawn: 1,
  });
  assert.equal(
    Object.values(counts).reduce((total, count) => total + count, 0),
    6,
  );
  assert.equal(
    groupApplicationsByWeek(applications, new Date("2026-10-25T12:00:00.000Z")).reduce(
      (total, week) => total + week.count,
      0,
    ),
    0,
  );
});

test("returns eight Monday-based weeks and groups applications in the correct week", () => {
  const now = new Date("2026-10-25T12:00:00.000Z");
  const currentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const firstWeek = subWeeks(currentWeek, 7);
  const result = groupApplicationsByWeek(
    [
      application("oldest", new Date(firstWeek.getTime() + 12 * 60 * 60 * 1000).toISOString()),
      application(
        "same-week",
        new Date(firstWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      ),
      application("this-week", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()),
      application(
        "next-week",
        new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    ],
    now,
  );

  assert.equal(result.length, 8);
  assert.equal(result[0]?.weekStart.getTime(), firstWeek.getTime());
  assert.equal(result[0]?.count, 2);
  assert.equal(result[7]?.count, 1);
});

test("ignores invalid dates and applications outside the eight-week window", () => {
  const now = new Date("2026-10-25T12:00:00.000Z");
  const firstWeek = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 7);
  const result = groupApplicationsByWeek(
    [
      application("too-old", new Date(firstWeek.getTime() - 1).toISOString()),
      application("invalid", "not-a-date"),
    ],
    now,
  );

  assert.equal(
    result.reduce((total, week) => total + week.count, 0),
    0,
  );
});
