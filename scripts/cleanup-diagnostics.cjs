/**
 * Cleanup script: Remove all diagnostic logging from source files
 * Run this to restore files to production state
 */
const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/pages/candidate/CandidateDashboardPage.tsx',
  'src/features/authentication/context/AuthContext.tsx',
  'src/features/candidates/hooks/useCandidate.ts',
];

const diagnosticImports = [
  "import { diagnosticLogger } from \"@/services/diagnosticLogger\";",
  'import { diagnosticLogger } from "@/services/diagnosticLogger";',
];

const diagnosticPatterns = [
  /\s*const renderCountRef = useRef\(0\);[\s\S]*?diagnosticLogger\.log\('COMPONENT_RENDER'[\s\S]*?\}, 'CandidateDashboardPage'\);?\n/,
  /\s*diagnosticLogger\.log\('[^']+',[\s\S]*?\);?\n/,
  /\s*diagnosticLogger\.recordSetterCall\([^)]+\);?\n/,
  /\s*diagnosticLogger\.recordEffectExecution\([^)]+\);?\n/,
  /\s*await page\.evaluate\(\(\) => new Promise\(resolve => setTimeout\(resolve, \d+\)\)\);/g,
  /,\s*useRef\s*from "react"/ // Remove unused useRef import
];

function cleanFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalLength = content.length;

  // Remove diagnostic imports
  diagnosticImports.forEach(imp => {
    content = content.replace(imp + '\n', '');
    content = content.replace(imp, '');
  });

  // Remove diagnostic calls and logging blocks
  diagnosticPatterns.forEach((pattern, index) => {
    if (pattern instanceof RegExp) {
      content = content.replace(pattern, '\n');
    }
  });

  // Clean up extra blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  const cleanedLength = content.length;
  const removed = originalLength - cleanedLength;

  if (removed > 0) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Cleaned: ${filePath} (removed ${removed} characters)`);
  } else {
    console.log(`⚠️  No changes needed: ${filePath}`);
  }
}

// Run cleanup
console.log('🧹 Cleaning diagnostic logging...\n');
filesToClean.forEach(cleanFile);
console.log('\n✅ Cleanup complete!');
console.log('\nNote: Manual review recommended for:');
console.log('  - src/pages/candidate/CandidateDashboardPage.tsx');
console.log('  - src/features/authentication/context/AuthContext.tsx');
console.log('  - src/features/candidates/hooks/useCandidate.ts');
