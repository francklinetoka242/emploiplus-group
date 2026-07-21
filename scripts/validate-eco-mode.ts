/**
 * FICHIER DE VALIDATION - Mode Économie de Données
 * 
 * À exécuter pour valider que tout est correctement configuré
 * Run: npx ts-node scripts/validate-eco-mode.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const PROJECT_ROOT = process.cwd();

interface ValidationResult {
  file: string;
  exists: boolean;
  size: number;
  status: "✅" | "❌" | "⚠️";
  message: string;
}

const results: ValidationResult[] = [];

/**
 * Vérifie l'existence d'un fichier
 */
function checkFile(relativePath: string): ValidationResult {
  const fullPath = resolve(PROJECT_ROOT, "src", relativePath);
  const exists = existsSync(fullPath);
  let size = 0;
  let status: "✅" | "❌" | "⚠️" = "❌";
  let message = "Fichier manquant";

  if (exists) {
    try {
      const content = readFileSync(fullPath, "utf-8");
      size = content.length;
      status = "✅";
      message = `OK (${size} bytes)`;
    } catch (error) {
      status = "❌";
      message = `Erreur lecture : ${(error as Error).message}`;
    }
  }

  return { file: relativePath, exists, size, status, message };
}

/**
 * Vérifie qu'un fichier contient du texte
 */
function checkFileContains(filePath: string, searchText: string): boolean {
  const fullPath = resolve(PROJECT_ROOT, "src", filePath);
  if (!existsSync(fullPath)) return false;

  try {
    const content = readFileSync(fullPath, "utf-8");
    return content.includes(searchText);
  } catch {
    return false;
  }
}

/**
 * Valide les imports
 */
function validateImports(): ValidationResult[] {
  const importChecks: ValidationResult[] = [];

  // Check EcoModeContext imports
  const hasEcoModeContext = checkFileContains(
    "contexts/EcoModeContext.tsx",
    "export function EcoModeProvider",
  );
  importChecks.push({
    file: "contexts/EcoModeContext - Exports",
    exists: hasEcoModeContext,
    size: 0,
    status: hasEcoModeContext ? "✅" : "❌",
    message: hasEcoModeContext ? "Provider exported" : "Provider not found",
  });

  // Check useEcoMode hook
  const hasUseEcoMode = checkFileContains(
    "contexts/EcoModeContext.tsx",
    "export function useEcoMode",
  );
  importChecks.push({
    file: "contexts/EcoModeContext - useEcoMode",
    exists: hasUseEcoMode,
    size: 0,
    status: hasUseEcoMode ? "✅" : "❌",
    message: hasUseEcoMode ? "Hook exported" : "Hook not found",
  });

  // Check EcoImage component
  const hasEcoImage = checkFileContains(
    "components/EcoImage.tsx",
    "export const EcoImage",
  );
  importChecks.push({
    file: "components/EcoImage - Export",
    exists: hasEcoImage,
    size: 0,
    status: hasEcoImage ? "✅" : "❌",
    message: hasEcoImage ? "Component exported" : "Component not found",
  });

  // Check utils functions
  const hasUtils = checkFileContains("lib/eco-mode-utils.ts", "export function");
  importChecks.push({
    file: "lib/eco-mode-utils - Functions",
    exists: hasUtils,
    size: 0,
    status: hasUtils ? "✅" : "❌",
    message: hasUtils
      ? "Utility functions exported"
      : "No utility functions found",
  });

  return importChecks;
}

/**
 * Valide les configurations localStorage
 */
function validateLocalStorage(): ValidationResult {
  const hasStorageKey = checkFileContains(
    "contexts/EcoModeContext.tsx",
    'LOCAL_STORAGE_KEY = "emploiplus_eco_mode"',
  );

  return {
    file: "localStorage Configuration",
    exists: hasStorageKey,
    size: 0,
    status: hasStorageKey ? "✅" : "⚠️",
    message: hasStorageKey ? "Storage key configured" : "Warning: verify key",
  };
}

/**
 * Main validation
 */
function main(): void {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🌱 VALIDATION - Mode Économie de Données");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Check all required files
  const requiredFiles = [
    "contexts/EcoModeContext.tsx",
    "components/EcoImage.tsx",
    "hooks/useEcoMode.ts",
    "lib/eco-mode-utils.ts",
    "types/eco-mode.types.ts",
    "styles/eco-mode.css",
  ];

  console.log("📁 FICHIERS CRÉÉS :\n");
  const fileResults = requiredFiles.map((file) => checkFile(file));
  fileResults.forEach((result) => {
    console.log(`${result.status} ${result.file}`);
    console.log(`   └─ ${result.message}\n`);
  });

  // Check imports
  console.log("\n📦 EXPORTS & IMPORTS :\n");
  const importResults = validateImports();
  importResults.forEach((result) => {
    console.log(`${result.status} ${result.file}`);
    console.log(`   └─ ${result.message}\n`);
  });

  // Check localStorage
  console.log("\n💾 CONFIGURATION LOCALE :\n");
  const storageResult = validateLocalStorage();
  console.log(`${storageResult.status} ${storageResult.file}`);
  console.log(`   └─ ${storageResult.message}\n`);

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  const allResults = [...fileResults, ...importResults, storageResult];
  const successCount = allResults.filter((r) => r.status === "✅").length;
  const totalCount = allResults.length;

  console.log(`\n✅ RÉSUMÉ : ${successCount}/${totalCount} validations réussies\n`);

  if (successCount === totalCount) {
    console.log("🎉 Configuration complète et prête à l'usage !");
    console.log("\n📋 Prochaines étapes :");
    console.log("   1. Importer @/styles/eco-mode.css dans main.tsx");
    console.log("   2. Envelopper App avec <EcoModeProvider>");
    console.log("   3. Ajouter <EcoModeRootWrapper> après le Provider");
    console.log("   4. Remplacer <img> par <EcoImage /> sur pages critiques");
    console.log("   5. Ajouter bouton toggle dans la navigation");
    console.log("   6. Tester sur mobile");
  } else {
    console.log("⚠️ Problèmes détectés. Vérifiez les fichiers marqués ❌");
  }

  console.log("\n═══════════════════════════════════════════════════════════════\n");
}

// Run validation
main();
