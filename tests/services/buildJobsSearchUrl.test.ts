import assert from "node:assert/strict";
import test from "node:test";
import { buildJobsSearchUrl } from "../../src/features/jobs/search/buildJobsSearchUrl.ts";

test("omits blank search values", () => {
  assert.equal(buildJobsSearchUrl({ query: "   ", city: "" }), "/jobs");
  assert.equal(buildJobsSearchUrl({}), "/jobs");
});

test("encodes accented words and spaces", () => {
  assert.equal(
    buildJobsSearchUrl({ query: "Développeur senior", city: "Pointe-Noire" }),
    "/jobs?q=D%C3%A9veloppeur+senior&ville=Pointe-Noire",
  );
});

test("encodes URL-reserved characters", () => {
  assert.equal(
    buildJobsSearchUrl({ query: "C# + RH & Paie", city: "Brazzaville / Nord" }),
    "/jobs?q=C%23+%2B+RH+%26+Paie&ville=Brazzaville+%2F+Nord",
  );
});
