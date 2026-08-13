/**
 * Diagnostic script: Reproduce LOGIN → DASHBOARD vs RELOAD → DASHBOARD scenarios
 * 
 * Usage: node scripts/diagnostic-scenarios.cjs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMAIL = 'melinaetoka@gmail.com';
const PASSWORD = 'melinaetoka@gmail.com';
const BASE_URL = 'http://localhost:4174';
const LOGIN_URL = `${BASE_URL}/candidate/login`;
const DASHBOARD_URL = `${BASE_URL}/candidate/dashboard`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

async function getDiagnosticReport(page) {
  try {
    const report = await page.evaluate(() => {
      return window.__diagnosticLogger?.getReport() || { error: 'Logger not available' };
    });
    return report;
  } catch (err) {
    console.error('Failed to get diagnostic report:', err);
    return null;
  }
}

async function scenario_A_Login() {
  log(colors.bright + colors.cyan, '\n========== SCENARIO A: LOGIN → DASHBOARD ==========\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const location = msg.location();
    const text = msg.text();
    consoleLogs.push({
      type,
      location: `${location.url}:${location.lineNumber}`,
      text,
      timestamp: new Date().toISOString(),
    });
    if (text.includes('[DIAG]') || text.includes('[Dashboard]')) {
      log(colors.blue, `[CONSOLE] ${text}`);
    }
  });

  try {
    log(colors.green, '[Step 1] Navigate to login page');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

    log(colors.green, '[Step 2] Enter credentials and login');
    
    // Wait for email input
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    } catch (e) {
      log(colors.yellow, 'Email input not found, trying alternative selector');
      try {
        await page.waitForSelector('input[inputmode="email"]', { timeout: 5000 });
      } catch (e2) {
        log(colors.red, 'Could not find email input');
        await browser.close();
        return null;
      }
    }
    
    // Type email and password
    await page.evaluate(() => {
      const emailInputs = document.querySelectorAll('input[type="email"], input[inputmode="email"]');
      if (emailInputs.length > 0) {
        emailInputs[0].focus();
      }
    });
    
    await page.keyboard.type(EMAIL);
    
    await page.evaluate(() => {
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      if (passwordInputs.length > 0) {
        passwordInputs[0].focus();
      }
    });
    
    await page.keyboard.type(PASSWORD);

    log(colors.green, '[Step 3] Click submit button');
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      log(colors.red, 'Submit button not found!');
      await browser.close();
      return null;
    }
    
    await submitButton.click();

    log(colors.green, '[Step 4] Wait for navigation to dashboard');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    } catch (e) {
      log(colors.yellow, 'Navigation timeout - may have completed')
    }

    const currentUrl = page.url();
    log(colors.green, `[Step 5] Current URL: ${currentUrl}`);

    log(colors.green, '[Step 6] Wait for component rendering and capture logs');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 4000)));

    const report_A = await getDiagnosticReport(page);

    log(colors.cyan, '\n--- SCENARIO A DIAGNOSTIC REPORT ---');
    if (report_A) {
      log(colors.cyan, `Total Events: ${report_A.totalEvents}`);
      log(colors.cyan, `Render Counts:`, JSON.stringify(report_A.renderCounts, null, 2));
      log(colors.cyan, `Effect Execution Counts:`, JSON.stringify(report_A.effectCounts, null, 2));
      log(colors.cyan, `Setter Call Counts:`, JSON.stringify(report_A.setterCalls, null, 2));
      
      log(colors.cyan, '\n--- EVENT CHRONOLOGY ---');
      const lines = report_A.chronology.split('\n');
      lines.slice(0, 50).forEach(line => {
        if (line.includes('RENDER') || line.includes('EFFECT') || line.includes('SETTER') || line.includes('AUTH') || line.includes('PROFILE')) {
          log(colors.yellow, line);
        }
      });
      if (lines.length > 50) {
        log(colors.yellow, `... and ${lines.length - 50} more events`);
      }
    }

    await browser.close();
    return report_A;

  } catch (err) {
    log(colors.red, `Error in Scenario A: ${err.message}`);
    await browser.close();
    return null;
  }
}

async function scenario_B_Reload() {
  log(colors.bright + colors.cyan, '\n========== SCENARIO B: RELOAD → DASHBOARD ==========\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const location = msg.location();
    const text = msg.text();
    consoleLogs.push({
      type,
      location: `${location.url}:${location.lineNumber}`,
      text,
      timestamp: new Date().toISOString(),
    });
    if (text.includes('[DIAG]') || text.includes('[Dashboard]')) {
      log(colors.blue, `[CONSOLE] ${text}`);
    }
  });

  try {
    log(colors.green, '[Step 1] Navigate directly to dashboard (with existing session)');
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
      log(colors.yellow, 'Navigation timeout - session may be restored');
    });

    const currentUrl = page.url();
    log(colors.green, `[Step 2] Current URL after navigation: ${currentUrl}`);

    log(colors.green, '[Step 3] Wait for component rendering and capture logs');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

    const report_B = await getDiagnosticReport(page);

    log(colors.cyan, '\n--- SCENARIO B DIAGNOSTIC REPORT ---');
    if (report_B) {
      log(colors.cyan, `Total Events: ${report_B.totalEvents}`);
      log(colors.cyan, `Render Counts:`, JSON.stringify(report_B.renderCounts, null, 2));
      log(colors.cyan, `Effect Execution Counts:`, JSON.stringify(report_B.effectCounts, null, 2));
      log(colors.cyan, `Setter Call Counts:`, JSON.stringify(report_B.setterCalls, null, 2));
      
      log(colors.cyan, '\n--- EVENT CHRONOLOGY ---');
      const lines = report_B.chronology.split('\n');
      lines.slice(0, 50).forEach(line => {
        if (line.includes('RENDER') || line.includes('EFFECT') || line.includes('SETTER') || line.includes('AUTH') || line.includes('PROFILE')) {
          log(colors.yellow, line);
        }
      });
      if (lines.length > 50) {
        log(colors.yellow, `... and ${lines.length - 50} more events`);
      }
    }

    await browser.close();
    return report_B;

  } catch (err) {
    log(colors.red, `Error in Scenario B: ${err.message}`);
    await browser.close();
    return null;
  }
}

async function compareScenarios(report_A, report_B) {
  log(colors.bright + colors.cyan, '\n========== COMPARISON ANALYSIS ==========\n');

  if (!report_A || !report_B) {
    log(colors.red, 'Cannot compare: missing diagnostic data');
    return;
  }

  log(colors.cyan, '\n--- TOTAL EVENTS ---');
  log(colors.yellow, `Scenario A (LOGIN): ${report_A.totalEvents} events`);
  log(colors.yellow, `Scenario B (RELOAD): ${report_B.totalEvents} events`);

  log(colors.cyan, '\n--- RENDER COUNT COMPARISON ---');
  const renderKeysA = Object.keys(report_A.renderCounts);
  const renderKeysB = Object.keys(report_B.renderCounts);
  
  for (const key of new Set([...renderKeysA, ...renderKeysB])) {
    const countA = report_A.renderCounts[key] || 0;
    const countB = report_B.renderCounts[key] || 0;
    const diff = countA - countB;
    const mark = diff > 0 ? '🔴' : diff < 0 ? '🟢' : '⚪';
    log(colors.yellow, `${mark} ${key}: A=${countA}, B=${countB} (diff=${diff})`);
  }

  log(colors.cyan, '\n--- EFFECT EXECUTION COMPARISON ---');
  const effectKeysA = Object.keys(report_A.effectCounts);
  const effectKeysB = Object.keys(report_B.effectCounts);
  
  for (const key of new Set([...effectKeysA, ...effectKeysB])) {
    const countA = report_A.effectCounts[key] || 0;
    const countB = report_B.effectCounts[key] || 0;
    const diff = countA - countB;
    const mark = diff > 0 ? '🔴' : diff < 0 ? '🟢' : '⚪';
    log(colors.yellow, `${mark} ${key}: A=${countA}, B=${countB} (diff=${diff})`);
  }

  log(colors.cyan, '\n--- FIRST DIFFERING EVENT ---');
  const eventsA = report_A.events || [];
  const eventsB = report_B.events || [];
  
  let firstDiff = null;
  for (let i = 0; i < Math.min(eventsA.length, eventsB.length); i++) {
    if (eventsA[i].type !== eventsB[i].type || eventsA[i].component !== eventsB[i].component) {
      firstDiff = {
        index: i,
        eventA: eventsA[i],
        eventB: eventsB[i],
      };
      break;
    }
  }

  if (firstDiff) {
    log(colors.red, `First difference at event #${firstDiff.index}:`);
    log(colors.yellow, `A: ${firstDiff.eventA.type} (${firstDiff.eventA.component})`);
    log(colors.yellow, `B: ${firstDiff.eventB.type} (${firstDiff.eventB.component})`);
  } else {
    log(colors.green, 'No differences found in event sequence');
  }
}

async function main() {
  log(colors.bright + colors.green, '\n🔍 DIAGNOSTIC: LOGIN vs RELOAD Scenarios\n');
  
  const report_A = await scenario_A_Login();
  const report_B = await scenario_B_Reload();
  
  await compareScenarios(report_A, report_B);

  // Save reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(process.cwd(), 'diagnostic-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  if (report_A) {
    fs.writeFileSync(
      path.join(reportDir, `scenario-A-${timestamp}.json`),
      JSON.stringify(report_A, null, 2)
    );
  }

  if (report_B) {
    fs.writeFileSync(
      path.join(reportDir, `scenario-B-${timestamp}.json`),
      JSON.stringify(report_B, null, 2)
    );
  }

  log(colors.green, `\n✅ Reports saved to diagnostic-reports/ directory\n`);
  process.exit(0);
}

main().catch(err => {
  log(colors.red, `Fatal error: ${err.message}`);
  process.exit(1);
});
