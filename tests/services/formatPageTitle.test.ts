import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPageTitle,
  getOpenGraphImageType,
} from "../../src/features/seo/utils/formatPageTitle.ts";

const brand = "EmploiPlus Group";

test("adds the brand suffix to a page title", () => {
  assert.equal(formatPageTitle("Offres d’emploi", brand), "Offres d’emploi | EmploiPlus Group");
});

test("does not duplicate a brand already present in the title", () => {
  assert.equal(
    formatPageTitle("Connexion - EMPLOIPLUS GROUP", brand),
    "Connexion - EMPLOIPLUS GROUP",
  );
});

test("does not add a suffix to a title equal to the brand", () => {
  assert.equal(formatPageTitle(brand, brand), brand);
});

test("uses the brand alone for an empty title", () => {
  assert.equal(formatPageTitle("   ", brand), brand);
});

test("returns the correct Open Graph image MIME type", () => {
  assert.equal(
    getOpenGraphImageType("https://emploiplus-group.com/og-default.svg?v=1"),
    "image/svg+xml",
  );
  assert.equal(getOpenGraphImageType("/sharing/image.webp"), "image/webp");
  assert.equal(getOpenGraphImageType("/sharing/image.png"), "image/png");
  assert.equal(getOpenGraphImageType("/sharing/image.jpeg"), "image/jpeg");
  assert.equal(getOpenGraphImageType("/sharing/image.unknown"), null);
});
