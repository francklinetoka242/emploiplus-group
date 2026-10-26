import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  SERVICES_DATA,
  SERVICES_INQUIRY_SUBJECT,
} from "../../src/features/services/servicesData.ts";
import { readContactSubject } from "../../src/features/services/contactSubject.ts";

const declaredRoutes = [
  "/services/mise-disposition-rh",
  "/services/recrutement",
  "/services/externalisation",
  "/services/conseil-formation",
];
const appRoutes = readFileSync(new URL("../../src/App.tsx", import.meta.url), "utf8");

test("provides complete, routable summaries for all four services", () => {
  assert.equal(SERVICES_DATA.length, 4);
  for (const service of SERVICES_DATA) {
    assert.ok(service.name);
    assert.ok(declaredRoutes.includes(service.route));
    assert.ok(service.promise);
    assert.ok(service.prestations.length >= 3);
    assert.ok(service.contactSubjects.length > 0);
    assert.ok(appRoutes.includes(`path="${service.route}"`));
  }
  assert.deepEqual(
    SERVICES_DATA.map((service) => service.route),
    declaredRoutes,
  );
});

test("service overview copy avoids unverified percentages and claims", () => {
  const copy = [
    ...SERVICES_DATA.flatMap((service) => [
      service.name,
      service.promise,
      service.audience,
      ...service.prestations,
      service.modalities ?? "",
      ...service.contactSubjects,
    ]),
    SERVICES_INQUIRY_SUBJECT,
  ].join(" ");

  assert.doesNotMatch(copy, /\d+\s*%/u);
  assert.doesNotMatch(
    copy,
    /\b(garantie|garanti|gratuit|gratuite|satisfaction|meilleur|rapide|rapidement)\b/iu,
  );
});

test("reads and decodes a contact subject from a query string", () => {
  assert.equal(readContactSubject(""), "");
  assert.equal(readContactSubject("?subject="), "");
  assert.equal(
    readContactSubject("?subject=Besoin+de+mise+%C3%A0+disposition+-+Int%C3%A9rim"),
    "Besoin de mise à disposition - Intérim",
  );
  assert.equal(readContactSubject("?subject=RH%20%26%20administration%3F"), "RH & administration?");
});
