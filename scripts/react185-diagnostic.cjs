/**
 * React #185 Diagnostic: setRecommendedPage Loop Test
 * 
 * Hypothesis: CandidateDashboardPage → reloadCandidateDocuments → setCandidateDocuments
 * → resetRecommendedPage → setRecommendedPage(1) → re-render → loop
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMAIL = 'melinaetoka@gmail.com';
const PASSWORD = 'melinaetoka@gmail.com';
const BASE_URL = 'http://localhost:4175';
const LOGIN_URL = `${BASE_URL}/candidate/login`;
const DASHBOARD_URL = `${BASE_URL}/candidate/dashboard`;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

async function runDiagnostic() {
  log(colors.bright + colors.cyan, '\n========== REACT #185 DIAGNOSTIC ==========\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  // Diagnostic data collection
  const diagnostic = {
    timestamp: new Date().toISOString(),
    scenario: 'LOGIN_TO_DASHBOARD',
    consoleLogs: [],
    pageErrors: [],
    metrics: {
      renderCount: 0,
      reloadCandidateDocumentsCount: 0,
      resetRecommendedPageCount: 0,
      setRecommendedPageCount: 0,
      loadRecommendedJobsCount: 0,
      setCandidateDocumentsCount: 0,
      setRecommendedJobsCount: 0,
      setRecommendedLoadingCount: 0,
      setHasMoreRecommendedJobsCount: 0,
    },
    react185Detected: false,
    react185Messages: [],
    dependencies: {
      profileId: [],
      cvUrl: [],
      cvText: [],
      embedding: [],
      recommendationContextSignature: [],
      recommendedPage: [],
    },
    executionSequence: [],
    phase: 'init',
  };

  // Listen to console messages
  page.on('console', async msg => {
    const text = msg.text();
    diagnostic.consoleLogs.push({
      type: msg.type(),
      text,
      timestamp: new Date().toISOString(),
    });

    // Detect render and effect execution
    if (text.includes('COMPONENT_RENDER')) {
      diagnostic.metrics.renderCount++;
      log(colors.magenta, `[RENDER] Count: ${diagnostic.metrics.renderCount}`);
    }

    if (text.includes('RELOAD_DOCS_START')) {
      diagnostic.metrics.reloadCandidateDocumentsCount++;
      log(colors.blue, `[RELOAD_DOCS] #${diagnostic.metrics.reloadCandidateDocumentsCount}`);
      diagnostic.executionSequence.push({
        action: 'reloadCandidateDocuments',
        count: diagnostic.metrics.reloadCandidateDocumentsCount,
        timestamp: new Date().toISOString(),
      });
    }

    if (text.includes('EFFECT_RESET_PAGE')) {
      diagnostic.metrics.resetRecommendedPageCount++;
      log(colors.blue, `[RESET_PAGE] #${diagnostic.metrics.resetRecommendedPageCount}`);
      diagnostic.executionSequence.push({
        action: 'resetRecommendedPage',
        count: diagnostic.metrics.resetRecommendedPageCount,
        timestamp: new Date().toISOString(),
      });
    }

    if (text.includes('setRecommendedPage')) {
      diagnostic.metrics.setRecommendedPageCount++;
      log(colors.yellow, `[SET_RECOMMENDED_PAGE] Count: ${diagnostic.metrics.setRecommendedPageCount}`);
      diagnostic.executionSequence.push({
        action: 'setRecommendedPage',
        count: diagnostic.metrics.setRecommendedPageCount,
        timestamp: new Date().toISOString(),
      });
    }

    if (text.includes('EFFECT_START') && text.includes('loadRecommendedJobs')) {
      diagnostic.metrics.loadRecommendedJobsCount++;
      log(colors.cyan, `[LOAD_RECOMMENDED] #${diagnostic.metrics.loadRecommendedJobsCount}`);
      diagnostic.executionSequence.push({
        action: 'loadRecommendedJobs',
        count: diagnostic.metrics.loadRecommendedJobsCount,
        timestamp: new Date().toISOString(),
      });
    }

    if (text.includes('setCandidateDocuments')) {
      diagnostic.metrics.setCandidateDocumentsCount++;
      log(colors.green, `[SET_DOCUMENTS] Count: ${diagnostic.metrics.setCandidateDocumentsCount}`);
    }

    if (text.includes('setRecommendedJobs')) {
      diagnostic.metrics.setRecommendedJobsCount++;
    }

    // Track dependencies
    if (text.includes('profileId')) {
      const match = text.match(/profileId['":\s]+([a-f0-9-]+)/i);
      if (match?.[1]) {
        if (!diagnostic.dependencies.profileId.includes(match[1])) {
          diagnostic.dependencies.profileId.push(match[1]);
        }
      }
    }

    // Detect React errors
    if (text.includes('Too many re-renders') || text.includes('Error: Too many re-renders')) {
      diagnostic.react185Detected = true;
      diagnostic.react185Messages.push(text);
      log(colors.red, `🔥 REACT #185 DETECTED: ${text}`);
    }
  });

  page.on('pageerror', err => {
    log(colors.red, `[PAGE ERROR] ${err.message}`);
    diagnostic.pageErrors.push({
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    if (err.message.includes('Too many re-renders')) {
      diagnostic.react185Detected = true;
      diagnostic.react185Messages.push(err.message);
    }
  });

  try {
    // PHASE 1: Navigate to login
    log(colors.green, '\n--- PHASE 1: Login Flow ---\n');
    diagnostic.phase = 'login';

    log(colors.green, 'Navigate to login page...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));

    // PHASE 2: Login
    log(colors.green, 'Filling login form...');
    await page.evaluate((email, pass) => {
      const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('input[inputmode="email"]');
      const passInput = document.querySelector('input[type="password"]');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = pass;
    }, EMAIL, PASSWORD);

    log(colors.green, 'Submitting login form...');
    
    // Reset metrics for dashboard phase
    Object.keys(diagnostic.metrics).forEach(key => {
      diagnostic.metrics[key] = 0;
    });
    diagnostic.consoleLogs = [];
    diagnostic.executionSequence = [];

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
    ]).catch(err => {
      log(colors.yellow, `Navigation timeout (expected): ${err.message}`);
    });

    diagnostic.phase = 'dashboard-loaded';
    log(colors.green, `Current URL: ${page.url()}`);

    // PHASE 3: Wait for dashboard to fully render
    log(colors.yellow, '\n--- PHASE 3: Dashboard Initialization ---\n');
    log(colors.yellow, 'Waiting for effects and renders to settle...');
    await page.evaluate(() => new Promise(r => setTimeout(r, 5000)));

    log(colors.yellow, `\n--- METRICS AFTER DASHBOARD LOAD ---`);
    log(colors.cyan, `Total renders: ${diagnostic.metrics.renderCount}`);
    log(colors.cyan, `reloadCandidateDocuments: ${diagnostic.metrics.reloadCandidateDocumentsCount}`);
    log(colors.cyan, `resetRecommendedPage: ${diagnostic.metrics.resetRecommendedPageCount}`);
    log(colors.cyan, `setRecommendedPage: ${diagnostic.metrics.setRecommendedPageCount}`);
    log(colors.cyan, `loadRecommendedJobs: ${diagnostic.metrics.loadRecommendedJobsCount}`);
    log(colors.cyan, `setCandidateDocuments: ${diagnostic.metrics.setCandidateDocumentsCount}`);
    log(colors.cyan, `React #185 Detected: ${diagnostic.react185Detected ? 'YES ❌' : 'NO ✅'}`);

    // PHASE 4: Check for stabilization
    const metricsB4 = { ...diagnostic.metrics };
    log(colors.yellow, '\n--- PHASE 4: Stabilization Check ---\n');
    log(colors.yellow, 'Waiting 3 more seconds to check for continued activity...');
    await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));

    log(colors.yellow, `\nMetrics changed:`);
    Object.keys(metricsB4).forEach(key => {
      if (diagnostic.metrics[key] !== metricsB4[key]) {
        log(colors.yellow, `  ${key}: ${metricsB4[key]} → ${diagnostic.metrics[key]} (delta: ${diagnostic.metrics[key] - metricsB4[key]})`);
      }
    });

    // PHASE 5: Execution sequence analysis
    log(colors.bright + colors.cyan, '\n--- EXECUTION SEQUENCE ---\n');
    if (diagnostic.executionSequence.length > 0) {
      diagnostic.executionSequence.forEach((item, idx) => {
        log(colors.magenta, `${idx + 1}. ${item.action} (count: ${item.count})`);
      });
    }

    // Save report
    const reportDir = path.join(process.cwd(), 'diagnostic-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(
      reportDir,
      `react185-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    fs.writeFileSync(reportPath, JSON.stringify(diagnostic, null, 2));
    log(colors.green, `\nDiagnostic report saved: ${reportPath}`);

    // Summary
    log(colors.bright + colors.cyan, '\n========== DIAGNOSTIC SUMMARY ==========\n');
    log(colors.yellow, `React #185 Detected: ${diagnostic.react185Detected ? '❌ YES' : '✅ NO'}`);
    log(colors.yellow, `Total Renders: ${diagnostic.metrics.renderCount}`);
    log(colors.yellow, `Total Setter Calls: ${diagnostic.metrics.setRecommendedPageCount}`);
    
    if (diagnostic.metrics.renderCount > 100) {
      log(colors.red, '⚠️  EXCESSIVE RENDERS - Potential infinite loop');
    } else if (diagnostic.metrics.renderCount > 20) {
      log(colors.yellow, '⚠️  Multiple renders detected - Check sequence');
    } else {
      log(colors.green, '✅ Normal render count');
    }

    if (diagnostic.react185Messages.length > 0) {
      log(colors.red, '\nReact #185 Error Messages:');
      diagnostic.react185Messages.forEach(msg => {
        log(colors.red, `  - ${msg}`);
      });
    }

  } catch (error) {
    log(colors.red, `\n❌ Error during diagnostic: ${error.message}`);
    diagnostic.phase = 'error';
    diagnostic.pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await browser.close();
  }
}

// Run the diagnostic
runDiagnostic().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
