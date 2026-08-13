import fs from "fs";
const content = fs.readFileSync("dist/assets/feature-admin-GNhulNl6.js", "utf8");
const lines = content.split("\n");

const line265 = lines[264];

// Position 26243 dans la ligne 265
const col = 26243;
const range = 350;

console.log("=== LIGNE 265, POSITION 26243 ===\n");
const substr1 = line265.substring(col - range, col + range);
console.log(substr1);

console.log("\n\n=== LIGNE 265, POSITION 26291 ===\n");
const col2 = 26291;
const substr2 = line265.substring(col2 - range, col2 + range);
console.log(substr2);

// Montrer où sont exactement 26243 et 26291
console.log("\n\n=== MARQUEURS ===");
const char1 = line265[col];
const char2 = line265[col2];
console.log("Position 26243 : [" + char1 + "]");
console.log("Position 26291 : [" + char2 + "]");

// Chercher les patterns clés autour
console.log("\n\n=== PATTERNS AUTOUR 26243 ===");
const start1 = Math.max(0, col - 200);
const end1 = Math.min(line265.length, col + 200);
console.log("Substring complet:");
console.log(line265.substring(start1, end1));
